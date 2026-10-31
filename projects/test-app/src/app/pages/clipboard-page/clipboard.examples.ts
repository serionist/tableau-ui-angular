import type { DocsExample } from '../../docs/docs-example';
import { ClipboardBasicExampleComponent } from './examples/clipboard-basic.example';
import basicHtml from './examples/clipboard-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/clipboard-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/clipboard-basic.example.ts?source' with { loader: 'text' };
import { ClipboardErrorsExampleComponent } from './examples/clipboard-errors.example';
import errorsHtml from './examples/clipboard-errors.example.html?source' with { loader: 'text' };
import errorsScss from './examples/clipboard-errors.example.scss?source' with { loader: 'text' };
import errorsTs from './examples/clipboard-errors.example.ts?source' with { loader: 'text' };

// The clipboard page's samples, each with the text of its files
export const CLIPBOARD_EXAMPLES = {
  basic: { component: ClipboardBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
  errors: { component: ClipboardErrorsExampleComponent, ts: errorsTs, html: errorsHtml, scss: errorsScss },
} satisfies Record<string, DocsExample>;
