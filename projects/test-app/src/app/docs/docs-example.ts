import type { Type } from '@angular/core';

/**
 * A sample on a docs page: the standalone component that runs, and the text of its files, which the build reads
 * through `?source` imports (src/source.d.ts). A page lists its samples in its `<page>.examples.ts`.
 */
export interface DocsExample {
  /** The sample, a standalone component in the page's `examples/` folder */
  readonly component: Type<unknown>;
  /** The text of its `.example.ts` */
  readonly ts: string;
  /** The text of its template, when it has a `templateUrl` */
  readonly html?: string;
  /** The text of its styles, when it has a `styleUrl` */
  readonly scss?: string;
}

/** A file a docs page shows: its tab or caption, and its text */
export interface DocsFile {
  readonly label: string;
  readonly source: string;
}

/** The sample's files in tab order, TS first, each one it has */
export function exampleFiles(example: DocsExample): DocsFile[] {
  const files: DocsFile[] = [{ label: 'TS', source: example.ts }];
  if (example.html !== undefined) {
    files.push({ label: 'HTML', source: example.html });
  }
  if (example.scss !== undefined) {
    files.push({ label: 'SCSS', source: example.scss });
  }
  return files;
}
