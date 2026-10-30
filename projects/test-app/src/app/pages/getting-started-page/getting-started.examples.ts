import type { DocsExample } from '../../docs/docs-example';
import { FirstButtonComponent } from './examples/first-button.example';
import firstButtonTs from './examples/first-button.example.ts?source' with { loader: 'text' };

// The getting started page's samples, each with the text of its files
export const GETTING_STARTED_EXAMPLES = {
  firstButton: { component: FirstButtonComponent, ts: firstButtonTs },
} satisfies Record<string, DocsExample>;
