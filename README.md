# sey-pdf

Private PDF tools. Files stay on your device.

sey-pdf is a local-first PDF editor that runs entirely in the browser. There is no
backend and nothing is uploaded: PDFs are read with PDF.js for previews and written
with pdf-lib on export.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Landing page: what sey-pdf is, the tools, use cases and why it is private |
| `/merge` | Combine several PDFs into one |
| `/split` | Select pages and extract them into a new PDF |
| `/organise` | Reorder, rotate, duplicate and delete pages |
| `/compress` | Opens with the export panel on the Balanced preset |

Every tool is the same page editor with its own wording (`src/tools.ts`), so files
stay in the workspace when you switch between them. Dropping PDFs on the landing
page opens Merge for several files and Organise for one.

## What works today

- Drop one or more PDFs (or use **Add PDF**); non-PDFs and unreadable files are rejected
- Page thumbnails for every page, colour-coded by source file
- Drag to reorder (mouse, long-press on touch, or Space + arrow keys)
- Rotate, duplicate and delete pages
- Select pages (click) to rotate, delete or extract them in bulk; Esc clears the selection
- **Export** opens a drawer on the right that shows the real download size, updating
  live as you edit, for all pages or just the selection
- Optional compression (Lossless, Balanced, Strong) with original vs compressed size,
  then download a PDF with exactly the pages shown, in order and rotation
- Merging is just dropping several files and exporting

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm run lint
```

Requires a modern browser. `crypto.randomUUID` needs a secure context, so use
`localhost` or HTTPS.

Routes use clean URLs (`/merge`, not `/#/merge`). `vite dev` and `vite preview`
handle this already; when hosting the `dist/` folder elsewhere, configure the host
to serve `index.html` for unknown paths (an SPA fallback / rewrite).

## How it works

The workspace is an array of lightweight page entries:

```ts
type PdfPage = { id: string; sourceId: string; sourcePageIndex: number; rotation: 0 | 90 | 180 | 270 };
```

Editing only changes that array. The PDF itself is built once, on export
(`src/lib/pdf.ts`), by copying each referenced page out of its source file and
applying its rotation. The same path powers merge, reorder, delete, duplicate,
rotate and extract.

The export drawer builds that PDF in the background (debounced) so the size it shows
is the size of the file you get; downloading reuses the same bytes.

Compression (`src/lib/compress.ts`) takes a PDF Blob and returns a smaller one, so
the UI does not depend on how it is done:

- **Lossless** deflates streams that were stored uncompressed.
- **Balanced / Strong** also re-encode large RGB and grey images (JPEG, or Flate
  with optional PNG predictors) as JPEG, capped at 2000 / 1200 px on the longest
  side. Text and vector content are untouched.
- Transparency masks, CMYK and other unusual images are left alone, an image is only
  replaced when the result is clearly smaller, and the output is never bigger than
  the input.

| Path | Role |
| --- | --- |
| `src/store/workspace.ts` | Reducer for sources, pages and selection |
| `src/lib/renderPdf.ts` | PDF.js: open, validate, render thumbnails |
| `src/lib/thumbnails.ts` | Thumbnail object-URL store (kept out of React state) |
| `src/lib/pdf.ts` | pdf-lib: build the output PDF |
| `src/lib/compress.ts` | Compression presets (Blob in, Blob out) |
| `src/features/export/` | Export drawer and the hook that builds/compresses in the background |
| `src/lib/download.ts` | Save a Blob as a file |
| `src/lib/router.ts` | Tiny pushState router (`usePath`, `navigate`) |
| `src/tools.ts` | The tools: route, name, copy and defaults |
| `src/pages/` | Landing page and the page editor |
| `src/components/` | Toolbar, page grid, page card, empty state, notices, links |

See [AGENTS.md](AGENTS.md) for the roadmap and the rules coding agents follow.
