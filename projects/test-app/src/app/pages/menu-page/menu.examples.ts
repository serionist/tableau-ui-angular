import type { DocsExample } from '../../docs/docs-example';
import { MenuButtonsExampleComponent } from './examples/menu-buttons.example';
import buttonsHtml from './examples/menu-buttons.example.html?source' with { loader: 'text' };
import buttonsTs from './examples/menu-buttons.example.ts?source' with { loader: 'text' };
import { MenuSimpleExampleComponent } from './examples/menu-simple.example';
import simpleHtml from './examples/menu-simple.example.html?source' with { loader: 'text' };
import simpleScss from './examples/menu-simple.example.scss?source' with { loader: 'text' };
import simpleTs from './examples/menu-simple.example.ts?source' with { loader: 'text' };
import { MenuWidthExampleComponent } from './examples/menu-width.example';
import widthHtml from './examples/menu-width.example.html?source' with { loader: 'text' };
import widthScss from './examples/menu-width.example.scss?source' with { loader: 'text' };
import widthTs from './examples/menu-width.example.ts?source' with { loader: 'text' };

// The menu page's samples, each with the text of its files
export const MENU_EXAMPLES = {
  simple: { component: MenuSimpleExampleComponent, ts: simpleTs, html: simpleHtml, scss: simpleScss },
  buttons: { component: MenuButtonsExampleComponent, ts: buttonsTs, html: buttonsHtml },
  width: { component: MenuWidthExampleComponent, ts: widthTs, html: widthHtml, scss: widthScss },
} satisfies Record<string, DocsExample>;
