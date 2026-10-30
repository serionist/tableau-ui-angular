import type { DocsExample } from '../../docs/docs-example';
import { ThemeOverrideExampleComponent } from './examples/theme-override.example';
import overrideHtml from './examples/theme-override.example.html?source' with { loader: 'text' };
import overrideScss from './examples/theme-override.example.scss?source' with { loader: 'text' };
import overrideTs from './examples/theme-override.example.ts?source' with { loader: 'text' };
import { ThemeSwitcherExampleComponent } from './examples/theme-switcher.example';
import switcherHtml from './examples/theme-switcher.example.html?source' with { loader: 'text' };
import switcherScss from './examples/theme-switcher.example.scss?source' with { loader: 'text' };
import switcherTs from './examples/theme-switcher.example.ts?source' with { loader: 'text' };

// The theming page's samples, each with the text of its files
export const THEMING_EXAMPLES = {
  switcher: { component: ThemeSwitcherExampleComponent, ts: switcherTs, html: switcherHtml, scss: switcherScss },
  override: { component: ThemeOverrideExampleComponent, ts: overrideTs, html: overrideHtml, scss: overrideScss },
} satisfies Record<string, DocsExample>;
