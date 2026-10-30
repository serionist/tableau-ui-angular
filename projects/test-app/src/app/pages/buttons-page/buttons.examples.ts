import type { DocsExample } from '../../docs/docs-example';
import { ButtonIconsExampleComponent } from './examples/button-icons.example';
import iconsHtml from './examples/button-icons.example.html?source' with { loader: 'text' };
import iconsScss from './examples/button-icons.example.scss?source' with { loader: 'text' };
import iconsTs from './examples/button-icons.example.ts?source' with { loader: 'text' };
import { ButtonLinksExampleComponent } from './examples/button-links.example';
import linksHtml from './examples/button-links.example.html?source' with { loader: 'text' };
import linksScss from './examples/button-links.example.scss?source' with { loader: 'text' };
import linksTs from './examples/button-links.example.ts?source' with { loader: 'text' };
import { ButtonRaisedExampleComponent } from './examples/button-raised.example';
import raisedHtml from './examples/button-raised.example.html?source' with { loader: 'text' };
import raisedScss from './examples/button-raised.example.scss?source' with { loader: 'text' };
import raisedTs from './examples/button-raised.example.ts?source' with { loader: 'text' };
import { ButtonStrokedExampleComponent } from './examples/button-stroked.example';
import strokedHtml from './examples/button-stroked.example.html?source' with { loader: 'text' };
import strokedScss from './examples/button-stroked.example.scss?source' with { loader: 'text' };
import strokedTs from './examples/button-stroked.example.ts?source' with { loader: 'text' };
import { ButtonToggleExampleComponent } from './examples/button-toggle.example';
import toggleHtml from './examples/button-toggle.example.html?source' with { loader: 'text' };
import toggleScss from './examples/button-toggle.example.scss?source' with { loader: 'text' };
import toggleTs from './examples/button-toggle.example.ts?source' with { loader: 'text' };

// The buttons page's samples, each with the text of its files
export const BUTTONS_EXAMPLES = {
  stroked: { component: ButtonStrokedExampleComponent, ts: strokedTs, html: strokedHtml, scss: strokedScss },
  raised: { component: ButtonRaisedExampleComponent, ts: raisedTs, html: raisedHtml, scss: raisedScss },
  links: { component: ButtonLinksExampleComponent, ts: linksTs, html: linksHtml, scss: linksScss },
  icons: { component: ButtonIconsExampleComponent, ts: iconsTs, html: iconsHtml, scss: iconsScss },
  toggle: { component: ButtonToggleExampleComponent, ts: toggleTs, html: toggleHtml, scss: toggleScss },
} satisfies Record<string, DocsExample>;
