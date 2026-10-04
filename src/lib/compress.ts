import {
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  type PDFObject,
} from 'pdf-lib';

export type CompressionPreset = 'lossless' | 'balanced' | 'strong';

/** Image re-encoding per preset: longest side in pixels and JPEG quality. */
const IMAGE_SETTINGS: Record<CompressionPreset, ImageSettings | null> = {
  lossless: null,
  balanced: { maxSide: 2000, quality: 0.75 },
  strong: { maxSide: 1200, quality: 0.5 },
};

type ImageSettings = { maxSide: number; quality: number };

/** Images smaller than this are not worth re-encoding. */
const MIN_IMAGE_BYTES = 10_000;
/** Streams smaller than this are not worth deflating. */
const MIN_STREAM_BYTES = 512;

const N = (name: string) => PDFName.of(name);

/**
 * Makes a PDF smaller. Blob in, Blob out, so callers don't depend on how it is
 * done. Never returns something bigger than the input.
 *
 * - lossless: deflates streams that were stored uncompressed.
 * - balanced / strong: also re-encodes large RGB and grey images as JPEG,
 *   downscaled to a maximum size. Text and vector content are untouched.
 */
export async function compressPdf(
  input: Blob,
  preset: CompressionPreset,
  signal?: AbortSignal,
): Promise<Blob> {
  const doc = await PDFDocument.load(await input.arrayBuffer());
  const settings = IMAGE_SETTINGS[preset];
  const objects = doc.context.enumerateIndirectObjects();
  const masks = softMaskRefs(objects);

  for (const [ref, object] of objects) {
    signal?.throwIfAborted();
    if (!(object instanceof PDFRawStream)) continue;

    let replacement: PDFRawStream | undefined;
    if (settings && isImage(object) && !masks.has(ref)) {
      replacement = await recompressImage(object, settings);
    }
    replacement ??= await deflateIfUncompressed(object);
    if (replacement) doc.context.assign(ref, replacement);
  }

  signal?.throwIfAborted();
  const bytes = (await doc.save({ useObjectStreams: true })) as Uint8Array<ArrayBuffer>;
  return bytes.length < input.size ? new Blob([bytes], { type: 'application/pdf' }) : input;
}

async function recompressImage(
  stream: PDFRawStream,
  { maxSide, quality }: ImageSettings,
): Promise<PDFRawStream | undefined> {
  const { dict, contents } = stream;
  if (contents.length < MIN_IMAGE_BYTES || typeof OffscreenCanvas === 'undefined') return;
  // Leave anything whose exact pixel values matter alone.
  const imageMask = dict.lookup(N('ImageMask'));
  if (imageMask instanceof PDFBool && imageMask.asBoolean()) return;
  if (dict.has(N('Decode')) || dict.lookup(N('Mask')) instanceof PDFArray) return;

  const width = numberOf(dict, 'Width');
  const height = numberOf(dict, 'Height');
  const colors = componentCount(dict);
  if (!width || !height || (colors !== 1 && colors !== 3)) return;

  let bitmap: ImageBitmap;
  try {
    const filter = singleFilter(dict);
    if (filter === 'DCTDecode') {
      // PDF viewers ignore EXIF orientation, so the decoder must too.
      bitmap = await createImageBitmap(new Blob([asBlobPart(contents)], { type: 'image/jpeg' }), {
        imageOrientation: 'none',
      });
    } else if ((filter === 'FlateDecode' || filter === null) && numberOf(dict, 'BitsPerComponent') === 8) {
      const raw = filter ? await inflate(contents) : contents;
      const pixels = unpredict(raw, dict, width, colors);
      if (!pixels || pixels.length < width * height * colors) return;
      bitmap = await createImageBitmap(toImageData(pixels, width, height, colors));
    } else {
      return;
    }
  } catch {
    return; // Corrupt or unsupported data: keep the original.
  }

  if (bitmap.width !== width || bitmap.height !== height) {
    bitmap.close();
    return;
  }

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const newWidth = Math.max(1, Math.round(width * scale));
  const newHeight = Math.max(1, Math.round(height * scale));
  const canvas = new OffscreenCanvas(newWidth, newHeight);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();
  const jpeg = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/jpeg', quality })).arrayBuffer());

  // Only trade quality for a real saving.
  if (jpeg.length > contents.length * 0.9) return;

  const newDict = dict.clone();
  newDict.delete(N('DecodeParms'));
  newDict.set(N('Width'), PDFNumber.of(newWidth));
  newDict.set(N('Height'), PDFNumber.of(newHeight));
  newDict.set(N('ColorSpace'), N('DeviceRGB'));
  newDict.set(N('BitsPerComponent'), PDFNumber.of(8));
  newDict.set(N('Filter'), N('DCTDecode'));
  return PDFRawStream.of(newDict, jpeg);
}

async function deflateIfUncompressed(stream: PDFRawStream): Promise<PDFRawStream | undefined> {
  const { dict, contents } = stream;
  if (dict.has(N('Filter')) || contents.length < MIN_STREAM_BYTES) return;
  // XMP metadata is conventionally left readable (and required to be for PDF/A).
  if (dict.lookup(N('Type')) === N('Metadata')) return;

  const deflated = await deflate(contents);
  if (deflated.length >= contents.length) return;
  const newDict = dict.clone();
  newDict.set(N('Filter'), N('FlateDecode'));
  return PDFRawStream.of(newDict, deflated);
}

/** Soft masks hold alpha and must stay single-channel, so they are never re-encoded. */
function softMaskRefs(objects: [PDFRef, PDFObject][]) {
  const refs = new Set<PDFRef>();
  for (const [, object] of objects) {
    if (!(object instanceof PDFRawStream) || !isImage(object)) continue;
    const mask = object.dict.get(N('SMask'));
    if (mask instanceof PDFRef) refs.add(mask);
  }
  return refs;
}

function isImage(stream: PDFRawStream) {
  return stream.dict.lookup(N('Subtype')) === N('Image');
}

function numberOf(dict: PDFDict, key: string) {
  const value = dict.lookup(N(key));
  return value instanceof PDFNumber ? value.asNumber() : undefined;
}

function componentCount(dict: PDFDict) {
  const space = dict.lookup(N('ColorSpace'));
  if (space === N('DeviceGray')) return 1;
  if (space === N('DeviceRGB')) return 3;
  if (space instanceof PDFArray && space.lookup(0) === N('ICCBased')) {
    const profile = space.lookup(1);
    if (profile instanceof PDFRawStream) return numberOf(profile.dict, 'N');
  }
  return undefined;
}

/** The stream's only filter name, null if unfiltered, undefined for filter chains. */
function singleFilter(dict: PDFDict) {
  let filter = dict.lookup(N('Filter'));
  if (filter === undefined) return null;
  if (filter instanceof PDFArray && filter.size() === 1) filter = filter.lookup(0);
  return filter instanceof PDFName ? filter.decodeText() : undefined;
}

/** Undoes PNG row prediction, the only predictor commonly used for images. */
function unpredict(data: Uint8Array, dict: PDFDict, width: number, colors: number) {
  let parms = dict.lookup(N('DecodeParms'));
  if (parms instanceof PDFArray) parms = parms.lookup(0);
  if (!(parms instanceof PDFDict)) return data;

  const predictor = numberOf(parms, 'Predictor') ?? 1;
  if (predictor === 1) return data;
  if (
    predictor < 10 ||
    (numberOf(parms, 'Colors') ?? 1) !== colors ||
    (numberOf(parms, 'BitsPerComponent') ?? 8) !== 8 ||
    (numberOf(parms, 'Columns') ?? 1) !== width
  ) {
    return undefined;
  }

  const rowLength = width * colors;
  const rows = Math.floor(data.length / (rowLength + 1));
  const out = new Uint8Array(rows * rowLength);
  let previous = new Uint8Array(rowLength);
  for (let y = 0; y < rows; y++) {
    const type = data[y * (rowLength + 1)];
    const row = data.subarray(y * (rowLength + 1) + 1, (y + 1) * (rowLength + 1));
    const current = out.subarray(y * rowLength, (y + 1) * rowLength);
    for (let x = 0; x < rowLength; x++) {
      const left = x >= colors ? current[x - colors] : 0;
      const up = previous[x];
      const upLeft = x >= colors ? previous[x - colors] : 0;
      let predicted = 0;
      if (type === 1) predicted = left;
      else if (type === 2) predicted = up;
      else if (type === 3) predicted = (left + up) >> 1;
      else if (type === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (type !== 0) return undefined;
      current[x] = (row[x] + predicted) & 0xff;
    }
    previous = current;
  }
  return out;
}

function toImageData(pixels: Uint8Array, width: number, height: number, colors: number) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += colors) {
    const o = i * 4;
    rgba[o] = pixels[j];
    rgba[o + 1] = pixels[colors === 1 ? j : j + 1];
    rgba[o + 2] = pixels[colors === 1 ? j : j + 2];
    rgba[o + 3] = 255;
  }
  return new ImageData(rgba, width, height);
}

// pdf-lib types its buffers loosely; they are always plain ArrayBuffers.
const asBlobPart = (bytes: Uint8Array) => bytes as Uint8Array<ArrayBuffer>;

async function pipe(bytes: Uint8Array, transform: CompressionStream | DecompressionStream) {
  const output = new Blob([asBlobPart(bytes)]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

const inflate = (bytes: Uint8Array) => pipe(bytes, new DecompressionStream('deflate'));
const deflate = (bytes: Uint8Array) => pipe(bytes, new CompressionStream('deflate'));
