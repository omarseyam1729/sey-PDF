# sey-pdf

Private PDF tools. Files stay on your device.

sey-pdf is a local-first PDF editor that runs entirely in the browser. There is no
backend and nothing is uploaded: PDFs are read with PDF.js for previews and written
with pdf-lib on export.

## What works today

- Drop one or more PDFs (or use **Add PDF**); non-PDFs and unreadable files are rejected
- Page thumbnails for every page, colour-coded by source file
- Drag to reorder (mouse, long-press on touch, or Space + arrow keys)
- Rotate, duplicate and delete pages
- Select pages (click) to rotate, delete or extract them in bulk; Esc clears the selection
- **Export** downloads a new PDF with exactly the pages shown, in order and rotation
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

## How it works

The workspace is an array of lightweight page entries:

```ts
type PdfPage = { id: string; sourceId: string; sourcePageIndex: number; rotation: 0 | 90 | 180 | 270 };
```

Editing only changes that array. The PDF itself is built once, on export
(`src/lib/pdf.ts`), by copying each referenced page out of its source file and
applying its rotation. The same path powers merge, reorder, delete, duplicate,
rotate and extract.

| Path | Role |
| --- | --- |
| `src/store/workspace.ts` | Reducer for sources, pages and selection |
| `src/lib/renderPdf.ts` | PDF.js: open, validate, render thumbnails |
| `src/lib/thumbnails.ts` | Thumbnail object-URL store (kept out of React state) |
| `src/lib/pdf.ts` | pdf-lib: build the output PDF |
| `src/lib/download.ts` | Save a Blob as a file |
| `src/components/` | Toolbar, page grid, page card, empty state, notices |

See [AGENTS.md](AGENTS.md) for the roadmap and the rules coding agents follow.
