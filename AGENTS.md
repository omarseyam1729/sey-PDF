# sey-pdf — Coding Agent Plan

## Goal

Build **sey-pdf** as a fast, local-first PDF web app using **Vite + React + TypeScript**.

The first version should let a user:

- Drop one or more PDFs
- See page thumbnails
- Reorder pages
- Delete pages
- Rotate pages
- Duplicate pages
- Merge PDFs
- Split/extract pages
- Export the result as a new PDF
- Compress PDFs later

Keep it simple. Ship the core workflow first.

---

## Product principle

**PDF files stay in the browser.**

Do not add a backend, database, auth, uploads, S3, or cloud processing unless a feature truly requires it.

For the initial product:

```text
User file
   ↓
Browser
   ↓
PDF.js / pdf-lib
   ↓
Blob
   ↓
Download
```

---

## Stack

Use:

```text
Vite
React
TypeScript
Tailwind
pdf-lib
pdfjs-dist
react-dropzone
dnd-kit
```

Optional later:

```text
Zustand
Web Workers
qpdf WASM
Vitest
Playwright
```

Do not add libraries without a clear reason.

---

# Phase 1 — Bootstrap

Create the app:

```bash
npm create vite@latest sey-pdf -- --template react-ts
cd sey-pdf

npm install pdf-lib pdfjs-dist react-dropzone @dnd-kit/core @dnd-kit/sortable
```

Add Tailwind.

Set up a simple structure:

```text
src/
├── components/
├── features/
├── lib/
│   ├── pdf.ts
│   ├── renderPdf.ts
│   └── download.ts
├── store/
├── types/
└── App.tsx
```

Do not create a huge architecture upfront.

---

# Phase 2 — File loading

Build a drag-and-drop area.

The user should be able to:

```text
drop A.pdf
drop B.pdf
drop C.pdf
```

Store each source file with an ID:

```ts
type PdfSource = {
  id: string;
  file: File;
  name: string;
  pageCount: number;
};
```

Use:

```ts
crypto.randomUUID()
```

Do not identify files by filename alone.

---

# Phase 3 — Page model

This is the central data model.

Represent every page in the workspace as:

```ts
type PdfPage = {
  id: string;
  sourceId: string;
  sourcePageIndex: number;
  rotation: 0 | 90 | 180 | 270;
};
```

Example:

```text
A.pdf = A0 A1 A2
B.pdf = B0 B1
```

Workspace:

```ts
[
  { sourceId: "A", sourcePageIndex: 0, rotation: 0 },
  { sourceId: "A", sourcePageIndex: 1, rotation: 0 },
  { sourceId: "B", sourcePageIndex: 0, rotation: 90 },
  { sourceId: "A", sourcePageIndex: 2, rotation: 0 }
]
```

Most page operations become trivial:

```text
merge     = concatenate page entries
delete    = remove page entry
reorder   = reorder array
duplicate = duplicate page entry
rotate    = change rotation
extract   = export subset
split     = partition array
```

Do not rewrite the actual PDF after every edit.

Only update this page array.

---

# Phase 4 — PDF preview

Use **PDF.js** only for viewing/rendering.

For every loaded PDF:

```text
File
 ↓
ArrayBuffer
 ↓
PDF.js
 ↓
page.render(...)
 ↓
canvas
```

Create small page thumbnails.

Target roughly:

```text
150–250 px wide
```

Do not render every page at full resolution.

Initial goal:

```text
drop PDF
↓
all page thumbnails appear
```

---

# Phase 5 — Page grid

Build a grid like:

```text
┌───────────────────────────────────────┐
│ sey-pdf                        Export │
├───────────────────────────────────────┤
│                                       │
│ [Page 1] [Page 2] [Page 3] [Page 4] │
│                                       │
│ [Page 5] [Page 6]                    │
│                                       │
├───────────────────────────────────────┤
│ Add PDF                               │
└───────────────────────────────────────┘
```

Each thumbnail should support:

```text
select
delete
rotate
duplicate
drag
```

---

# Phase 6 — Drag reorder

Use `dnd-kit`.

Only reorder the `PdfPage[]` array.

Example:

```text
Before

1 2 3 4

drag 4 before 2

After

1 4 2 3
```

Do not regenerate a PDF during drag.

---

# Phase 7 — Export

Use **pdf-lib**.

When the user clicks Export:

1. Create a new `PDFDocument`
2. Load each source PDF
3. Walk through the workspace page array
4. Copy pages from their source documents
5. Apply rotation
6. Add them to the output document
7. Save
8. Create a Blob
9. Download it

Conceptually:

```text
workspace pages
      ↓
read source PDF
      ↓
copy requested page
      ↓
apply rotation
      ↓
append to output PDF
      ↓
save()
      ↓
Blob
      ↓
download
```

This single export path powers:

```text
merge
reorder
delete
duplicate
rotate
extract
split
```

---

# Phase 8 — Merge PDF

This requires almost no separate PDF logic.

User drops:

```text
A.pdf
B.pdf
C.pdf
```

Append their pages to the workspace:

```text
A pages
+
B pages
+
C pages
```

Then Export.

Route:

```text
/merge
```

can simply open the same editor with merge-oriented UI.

---

# Phase 9 — Split / Extract

Let users select pages.

Example:

```text
selected:
2
3
5
```

Button:

```text
Extract selected pages
```

Export only those page entries.

For split ranges:

```text
1-3
4-8
9-10
```

Create one PDF for each range.

Zip multiple outputs later if needed.

---

# Phase 10 — Rotate

Each page already has:

```ts
rotation
```

Update:

```ts
rotation = (rotation + 90) % 360;
```

Show the thumbnail rotated.

Apply the same rotation during export.

---

# Phase 11 — Duplicate

Duplicate the page entry.

Example:

```text
A0 A1 A2
```

Duplicate A1:

```text
A0 A1 A1 A2
```

Give the duplicate a new workspace `id`.

Keep:

```text
sourceId
sourcePageIndex
```

the same.

---

# Phase 12 — Undo

Add after the core flow works.

For page operations, snapshot only lightweight workspace state:

```text
pages
selection
```

Do not snapshot PDF binary data.

Support:

```text
Cmd/Ctrl + Z
Cmd/Ctrl + Shift + Z
```

---

# Phase 13 — Images to PDF

Add:

```text
/image-to-pdf
```

Input:

```text
JPG
PNG
WebP
```

Let user reorder images.

Use `pdf-lib` to embed images into pages.

Basic options:

```text
A4
Letter
Fit image
Portrait
Landscape
Margins
```

---

# Phase 14 — PDF to Images

Add:

```text
/pdf-to-image
```

Use PDF.js:

```text
PDF page
 ↓
canvas
 ↓
canvas.toBlob()
 ↓
PNG / JPEG
```

Allow:

```text
1x
2x
3x
```

render scale.

---

# Phase 15 — Basic Edit PDF

Do not try to modify arbitrary existing PDF text.

Start with overlays:

```text
Add text
Add image
Draw
Highlight
Signature
Watermark
```

Treat them as objects positioned on a page.

Example:

```ts
type TextOverlay = {
  id: string;
  pageId: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
};
```

During export:

```text
copy original page
+
draw overlay
+
save
```

This is enough for a useful V1 editor.

---

# Phase 16 — Compression

Build this only after the core editor works.

Do not assume `pdf-lib` provides serious compression.

Start with a simple abstraction:

```ts
type CompressionPreset =
  | "lossless"
  | "balanced"
  | "strong";
```

Later investigate:

```text
qpdf WASM
image downsampling
JPEG recompression
WASM-based PDF compression
```

Avoid coupling the UI directly to one compression implementation.

UX:

```text
Original:     24.1 MB
Compressed:    7.4 MB
Saved:        69%
```

---

# Phase 17 — Web Workers

Do not begin by workerising the entire application.

First make everything correct.

Move expensive operations into Web Workers when they actually cause UI blocking:

```text
large export
compression
heavy image conversion
large rendering jobs
```

Main thread should remain responsive.

---

# Phase 18 — Large files

Be careful with memory.

Avoid unnecessary copies of:

```text
ArrayBuffer
Uint8Array
Blob
```

Prefer:

```text
File
Blob
object URLs
transferable ArrayBuffers
```

Do not put giant PDF buffers in React state.

For large files, show:

```text
Large document detected.
Processing happens locally and may use significant memory.
```

---

# Phase 19 — UI routes

Eventually:

```text
/
/merge
/compress
/split
/organise
/edit
/image-to-pdf
/pdf-to-image
```

Do not build seven separate PDF implementations.

Reuse the same core workspace.

---

# Phase 20 — Homepage

Keep it simple.

```text
                sey-pdf

       Private PDF tools.
     Files stay on your device.

┌──────────────┐ ┌──────────────┐
│ Merge PDF    │ │ Compress PDF │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Split PDF    │ │ Edit PDF     │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Image → PDF  │ │ PDF → Image  │
└──────────────┘ └──────────────┘
```

---

# Agent rules

Every coding agent must follow these.

## 1. Ship first

Do not build abstractions for hypothetical future requirements.

## 2. No backend

Do not create:

```text
FastAPI
Express API
database
S3
Redis
auth
```

unless explicitly requested.

## 3. Keep files local

Do not upload PDFs to external services.

## 4. PDF.js = viewing

Use PDF.js primarily for:

```text
load
inspect
render
thumbnail
```

## 5. pdf-lib = output/manipulation

Use pdf-lib for:

```text
copy pages
merge
rotate
draw overlays
export
```

## 6. Don't mutate PDFs on every UI action

UI actions modify lightweight state.

Export creates the final PDF.

## 7. Keep binary data out of React state

Do not dump huge `ArrayBuffer`s into component state or Zustand.

## 8. Avoid giant components

If `App.tsx` or a feature component becomes huge, split it.

## 9. Do not overengineer

Do not introduce:

```text
repository patterns
service locator
dependency injection framework
event bus
CQRS
microservices
```

for this project.

## 10. Test the real flow

The most important test is:

```text
drop PDFs
↓
render pages
↓
reorder
↓
rotate
↓
delete
↓
export
↓
open resulting PDF successfully
```

---

# Agent workflow

Before coding:

```text
1. Read the task.
2. Inspect relevant existing code.
3. Identify the smallest change.
4. Implement it.
5. Run typecheck/build/tests.
6. Report exactly what changed.
```

Do not casually refactor unrelated code.

---

# Initial task list

## Task 1

Bootstrap Vite + React + TypeScript + Tailwind.

---

## Task 2

Implement PDF drop zone.

Acceptance:

```text
user drops multiple PDFs
files are listed
invalid files are rejected
```

---

## Task 3

Load PDFs with PDF.js.

Acceptance:

```text
page count shown
first PDF renders successfully
```

---

## Task 4

Generate thumbnails for every page.

Acceptance:

```text
all pages visible as thumbnails
```

---

## Task 5

Create workspace page model.

Acceptance:

```text
each page maps back to its source file and source page index
```

---

## Task 6

Implement drag-and-drop reorder.

Acceptance:

```text
page array changes correctly
UI matches new order
```

---

## Task 7

Implement delete.

Acceptance:

```text
page disappears
remaining ordering stays correct
```

---

## Task 8

Implement rotate.

Acceptance:

```text
thumbnail rotation changes
exported page rotation matches
```

---

## Task 9

Implement duplicate.

Acceptance:

```text
duplicate page appears directly after source page
```

---

## Task 10

Implement export using pdf-lib.

Acceptance:

```text
exported PDF contains exactly the pages shown by the UI,
in exactly the same order and rotation
```

---

# MVP definition

The MVP is complete when this works reliably:

```text
Open sey-pdf
     ↓
Drop A.pdf and B.pdf
     ↓
See thumbnails
     ↓
Drag pages into desired order
     ↓
Delete unwanted pages
     ↓
Rotate pages
     ↓
Duplicate pages
     ↓
Click Export
     ↓
Download a correct PDF
```

Do not work on advanced editing or compression until this flow is solid.

---

# After MVP

Build features in this order:

```text
1. Extract pages
2. Split PDF
3. Images → PDF
4. PDF → Images
5. Undo / redo
6. Text overlays
7. Drawing
8. Highlighting
9. Signature
10. Watermark
11. Compression
12. Web Workers
13. Large-document optimisation
14. PWA / offline support
```

---

# Final instruction to coding agents

Build the smallest working version first.

When uncertain between:

```text
clever architecture
```

and:

```text
simple code that correctly ships the feature
```

choose the second one unless the simple solution creates an obvious correctness or performance problem.
