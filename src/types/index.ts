export type Rotation = 0 | 90 | 180 | 270;

/** A PDF the user dropped. `file` is a lazy handle, not the bytes. */
export type PdfSource = {
  id: string;
  file: File;
  name: string;
  pageCount: number;
};

/** One page in the workspace, pointing back at the page in its source PDF. */
export type PdfPage = {
  id: string;
  sourceId: string;
  sourcePageIndex: number;
  /** Extra rotation applied on top of the page's own rotation. */
  rotation: Rotation;
};
