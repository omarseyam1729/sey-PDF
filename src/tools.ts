import type { FC } from 'react';
import { CompressIcon, MergeIcon, OrganiseIcon, SplitIcon } from './components/icons';
import type { Compression } from './features/export/useExportFiles';

/**
 * A tool is a route into the same page editor with its own wording.
 * There is one workspace and one export path behind all of them.
 */
export type Tool = {
  path: string;
  name: string;
  icon: FC;
  /** One line for the landing page card. */
  summary: string;
  /** Empty-state heading in the editor. */
  dropTitle: string;
  /** How to use the tool, shown in the editor. */
  hint: string;
  /** Start with this preset and open the export panel as soon as there are pages. */
  compression?: Compression;
};

export const TOOLS: Tool[] = [
  {
    path: '/merge',
    name: 'Merge PDF',
    icon: MergeIcon,
    summary: 'Combine several PDFs into one file, in the order you choose.',
    dropTitle: 'Drop the PDFs you want to merge',
    hint: 'Pages are added in the order you drop the files. Drag them to rearrange, then Export.',
  },
  {
    path: '/split',
    name: 'Split PDF',
    icon: SplitIcon,
    summary: 'Pull the pages you need out of a long PDF into a new file.',
    dropTitle: 'Drop a PDF to split',
    hint: 'Click the pages you want to keep, then choose Extract to save them as a new PDF.',
  },
  {
    path: '/organise',
    name: 'Organise pages',
    icon: OrganiseIcon,
    summary: 'Reorder, rotate, duplicate or delete pages.',
    dropTitle: 'Drop PDFs to organise',
    hint: 'Drag pages to reorder them. Rotate, duplicate or delete from each page, then Export.',
  },
  {
    path: '/compress',
    name: 'Compress PDF',
    icon: CompressIcon,
    summary: 'Shrink image-heavy PDFs and see the new size before you download.',
    dropTitle: 'Drop a PDF to compress',
    hint: 'Pick a compression level in the export panel and compare sizes before downloading.',
    compression: 'balanced',
  },
];

export const findTool = (path: string) => TOOLS.find((tool) => tool.path === path);
