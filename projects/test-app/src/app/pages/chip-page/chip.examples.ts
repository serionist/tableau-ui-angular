import type { DocsExample } from '../../docs/docs-example';
import { ChipBasicExampleComponent } from './examples/chip-basic.example';
import basicHtml from './examples/chip-basic.example.html?source' with { loader: 'text' };
import basicScss from './examples/chip-basic.example.scss?source' with { loader: 'text' };
import basicTs from './examples/chip-basic.example.ts?source' with { loader: 'text' };
import { ChipControlExampleComponent } from './examples/chip-control.example';
import controlHtml from './examples/chip-control.example.html?source' with { loader: 'text' };
import controlScss from './examples/chip-control.example.scss?source' with { loader: 'text' };
import controlTs from './examples/chip-control.example.ts?source' with { loader: 'text' };
import { ChipFormsExampleComponent } from './examples/chip-forms.example';
import formsHtml from './examples/chip-forms.example.html?source' with { loader: 'text' };
import formsScss from './examples/chip-forms.example.scss?source' with { loader: 'text' };
import formsTs from './examples/chip-forms.example.ts?source' with { loader: 'text' };

// The chips page's samples, each with the text of its files
export const CHIP_EXAMPLES = {
  basic: { component: ChipBasicExampleComponent, ts: basicTs, html: basicHtml, scss: basicScss },
  control: { component: ChipControlExampleComponent, ts: controlTs, html: controlHtml, scss: controlScss },
  forms: { component: ChipFormsExampleComponent, ts: formsTs, html: formsHtml, scss: formsScss },
} satisfies Record<string, DocsExample>;
