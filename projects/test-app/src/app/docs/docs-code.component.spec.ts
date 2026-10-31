import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { ThemeService } from 'tableau-ui-angular/theme';
import { axeViolations } from '../../../../component-library/testing/axe';
import { CODE_COLOURS } from './docs-code-colours';
import { DocsCodeComponent } from './docs-code.component';
import { DOCS_MONACO_VS, DocsMonacoService } from './docs-monaco.service';

// The globals Monaco's AMD build puts on the page, which the specs share: one spec file that loads it loads it for all
const MONACO_GLOBALS = ['monaco', 'require', 'define'];
const page = window as unknown as Record<string, unknown>;

// A block for each language the site's code is in, by the label that names it
const BLOCKS: Record<string, string> = {
  TS: "import { signal } from '@angular/core';\n\n// counts the clicks\nexport const clicks = signal(1);\n",
  HTML: '<tab-chip class="large">{{ name }}</tab-chip>\n',
  SCSS: '.large {\n  // twice the size\n  margin: 2rem;\n}\n',
  'package.json': '{\n  "private": true,\n  "name": "my-app"\n}\n',
  command: 'npm install --save-dev tableau-ui-angular\n',
};

@Component({
  imports: [DocsCodeComponent],
  template: `
    <div [style.height]="$spacer()"></div>
    @for (block of $blocks(); track block.label) {
      <app-docs-code [label]="block.label" [source]="block.source" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BlocksComponent {
  readonly $blocks = input.required<{ label: string; source: string }[]>({ alias: 'blocks' });
  // Room above the blocks, to put them further down the page than a screen
  readonly $spacer = input('0', { alias: 'spacer' });
}

// The text as the block shows it: without the file's last line break
const shown = (label: string) => BLOCKS[label].replace(/\n$/, '');
const rgb = (colour: string) => `rgb(${[1, 3, 5].map(i => parseInt(colour.slice(i, i + 2), 16)).join(', ')})`;

describe('DocsCodeComponent', () => {
  let fixture: ComponentFixture<BlocksComponent>;

  // The site's own monaco-edit/vs, which the test server serves as the build does, unless a spec gives another path
  async function render(labels: string[], options: { vs?: string; spacer?: string } = {}) {
    if (options.vs !== undefined) {
      TestBed.configureTestingModule({ providers: [{ provide: DOCS_MONACO_VS, useValue: options.vs }] });
    }
    TestBed.inject(ThemeService).setColorMode('light');
    fixture = TestBed.createComponent(BlocksComponent);
    fixture.componentRef.setInput(
      'blocks',
      labels.map(label => ({ label, source: BLOCKS[label] })),
    );
    fixture.componentRef.setInput('spacer', options.spacer ?? '0');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const block = (host: HTMLElement, label: string) => host.querySelector<HTMLElement>(`pre[aria-label="${label}"]`)!;
  const coloured = (pre: HTMLElement) => Array.from(pre.querySelectorAll('span')).filter(span => span.style.color !== '');
  // The colour of the first run with this text, as the browser reads it
  const colourOf = (pre: HTMLElement, text: string) => Array.from(pre.querySelectorAll('span')).find(span => span.textContent === text)?.style.color;

  async function whenColoured(pre: HTMLElement) {
    await vi.waitFor(
      () => {
        expect(coloured(pre).length).toBeGreaterThan(0);
      },
      { timeout: 20000 },
    );
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
    for (const element of [document.documentElement, document.body]) {
      element.classList.remove('dark-mode');
    }
  });

  // A page with no Monaco yet, whose Monaco files are missing: the globals another spec's load left are put aside
  it('starts one load for all the blocks, and when it fails keeps their plain text and says so once', async () => {
    const saved = MONACO_GLOBALS.map(name => [name, page[name]] as const);
    // loader.js declares define with var, so it stays on the page, unset
    for (const name of MONACO_GLOBALS) {
      page[name] = undefined;
    }
    try {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const host = await render(['TS', 'HTML', 'SCSS'], { vs: '/missing/vs' });

      await vi.waitFor(() => {
        expect(warn).toHaveBeenCalledTimes(1);
      });
      await fixture.whenStable();

      expect(String(warn.mock.calls[0][1])).toContain('/missing/vs/loader.js did not load');
      expect(document.querySelectorAll('script[src$="/missing/vs/loader.js"]').length).toBe(1);
      for (const label of ['TS', 'HTML', 'SCSS']) {
        expect(block(host, label).textContent).toBe(shown(label));
        expect(coloured(block(host, label))).toEqual([]);
      }
    } finally {
      for (const [name, value] of saved) {
        page[name] = value;
      }
    }
  });

  it('colours each block in the language its label names, its text as it was', async () => {
    const host = await render(Object.keys(BLOCKS));
    for (const label of Object.keys(BLOCKS)) {
      await whenColoured(block(host, label));
    }

    const expected: [string, string, string][] = [
      ['TS', 'import', 'keyword'],
      ['TS', "'@angular/core'", 'string'],
      ['TS', '// counts the clicks', 'comment'],
      ['TS', '1', 'number'],
      ['HTML', '<', 'delimiter.html'],
      ['HTML', 'tab-chip', 'tag'],
      ['HTML', 'class', 'attribute.name'],
      ['HTML', '"large"', 'attribute.value.html'],
      ['SCSS', '// twice the size', 'comment'],
      ['SCSS', 'margin:', 'attribute.name'],
      ['SCSS', '2rem', 'number'],
      ['package.json', '"private"', 'string.key.json'],
      ['package.json', 'true', 'keyword.json'],
      ['package.json', '"my-app"', 'string.value.json'],
      ['command', 'npm', 'type'],
      ['command', '--save-dev', 'attribute.name'],
    ];
    expect(expected.map(([label, text]) => [label, text, colourOf(block(host, label), text)])).toEqual(expected.map(([label, text, scope]) => [label, text, rgb(CODE_COLOURS[scope].light)]));
    for (const label of Object.keys(BLOCKS)) {
      expect(block(host, label).textContent).toBe(shown(label));
    }
  });

  it('loads Monaco for a block within a screen below the view, before it is on screen', async () => {
    const host = await render(['TS'], { spacer: '150vh' });

    await whenColoured(block(host, 'TS'));
    expect(block(host, 'TS').getBoundingClientRect().top).toBeGreaterThan(window.innerHeight);
  });

  it('leaves a block further down than a screen plain, and loads Monaco once it comes near', async () => {
    const host = await render(['TS'], { spacer: '300vh' });
    // the observer's first answer, for a block that is not near
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(TestBed.inject(DocsMonacoService).$monaco()).toBeUndefined();
    expect(coloured(block(host, 'TS'))).toEqual([]);

    block(host, 'TS').scrollIntoView();
    await whenColoured(block(host, 'TS'));
    expect(block(host, 'TS').textContent).toBe(shown('TS'));
  });

  it("follows the site's mode: the colours change to dark and back, the text the same", async () => {
    const host = await render(['TS']);
    const pre = block(host, 'TS');
    await whenColoured(pre);
    expect(colourOf(pre, 'import')).toBe(rgb(CODE_COLOURS['keyword'].light));

    TestBed.inject(ThemeService).setColorMode('dark');
    await fixture.whenStable();
    expect([colourOf(pre, 'import'), colourOf(pre, '// counts the clicks')]).toEqual([rgb(CODE_COLOURS['keyword'].dark), rgb(CODE_COLOURS['comment'].dark)]);
    expect(pre.textContent).toBe(shown('TS'));

    TestBed.inject(ThemeService).setColorMode('light');
    await fixture.whenStable();
    expect(colourOf(pre, 'import')).toBe(rgb(CODE_COLOURS['keyword'].light));
  });

  it("copies a coloured block's plain text", async () => {
    const host = await render(['HTML']);
    await whenColoured(block(host, 'HTML'));
    const write = vi.spyOn(TestBed.inject(ClipboardService), 'writeText').mockResolvedValue();

    host.querySelector<HTMLButtonElement>('button[aria-label="Copy the HTML"]')!.click();

    await vi.waitFor(() => {
      expect(write).toHaveBeenCalledExactlyOnceWith(shown('HTML'));
    });
  });

  // A keyboard user tabs to a block further down: the focus scrolls it near, and the colours come in under the focus
  it('keeps the focus on the block, its role and its name while it is coloured', async () => {
    const host = await render(['TS'], { spacer: '300vh' });
    const pre = block(host, 'TS');
    expect(coloured(pre)).toEqual([]);

    pre.focus();
    await whenColoured(pre);

    expect(document.activeElement).toBe(pre);
    expect([pre.getAttribute('role'), pre.getAttribute('tabindex'), pre.getAttribute('aria-label')]).toEqual(['group', '0', 'TS']);
  });

  // The site's code background in each mode, as ThemeService.initialize() applies it: dark-mode on the root and body
  it("reads at 4.5:1 or more in every colour, on the code's background in light and in dark", async () => {
    const host = await render(Object.keys(BLOCKS));
    for (const label of Object.keys(BLOCKS)) {
      await whenColoured(block(host, label));
    }
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map(value => (value / 255 <= 0.04045 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const channels = (colour: string) => (colour.match(/\d+/g) ?? []).slice(0, 3).map(Number);

    for (const mode of ['light', 'dark'] as const) {
      TestBed.inject(ThemeService).setColorMode(mode);
      for (const element of [document.documentElement, document.body]) {
        element.classList.toggle('dark-mode', mode === 'dark');
      }
      await fixture.whenStable();

      const background = luminance(channels(getComputedStyle(host.querySelector('app-docs-code')!).backgroundColor));
      const low = Object.entries(CODE_COLOURS)
        .map(([scope, colours]) => {
          const [lighter, darker] = [luminance(channels(rgb(colours[mode]))), background].sort((a, b) => b - a);
          return { scope, ratio: (lighter + 0.05) / (darker + 0.05) };
        })
        .filter(({ ratio }) => ratio < 4.5);
      expect(low, mode).toEqual([]);
      expect(await axeViolations(host), mode).toEqual([]);
    }
  });
});
