import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { contrast } from '../../testing/contrast';
import { CONTRAST_PAIRS } from '../../testing/contrast-pairs';
import { movePointerAway } from '../../testing/pointer';
import { ThemeService } from './theme.service';

// The library's styles, as an app imports them: each listed pair, painted with its two properties, and the library's
// own error text and error buttons on the page
@Component({
  imports: [TableauUiButtonModule, TableauUiCommonModule],
  template: `
    @for (pair of pairs; track pair.where) {
      <div class="pair" [style.color]="'var(' + pair.text + ')'" [style.background-color]="'var(' + pair.background + ')'">{{ pair.where }}</div>
    }
    <tab-error>Required</tab-error>
    <button color="error" kind="raised">Delete</button>
    <button color="error" kind="stroked">Remove</button>
  `,
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ColoursComponent {
  protected readonly pairs = CONTRAST_PAIRS;
}

// An element's text colour on its background, as computed
function drawn(element: Element, background = getComputedStyle(element).backgroundColor): string {
  return `${getComputedStyle(element).color} on ${background}`;
}

const KEY = 'tableau-ui-angular:theme';

describe('The theme colours', () => {
  afterEach(() => {
    localStorage.removeItem(KEY);
    for (const element of [document.documentElement, document.body]) {
      element.classList.remove('dark-mode');
      element.style.removeProperty('color-scheme');
    }
    document.documentElement.style.removeProperty('--twc-font-size-body');
  });

  // Renders the colours, and applies each mode in turn through the theme service, as an app does
  async function render() {
    const fixture = TestBed.createComponent(ColoursComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const theme = TestBed.inject(ThemeService);
    theme.initialize();
    const apply = async (mode: 'dark' | 'light') => {
      theme.setColorMode(mode);
      await fixture.whenStable();
      expect(document.documentElement.classList.contains('dark-mode'), mode).toBe(mode === 'dark');
    };
    const listed = () => Array.from(host.querySelectorAll('.pair'), pair => drawn(pair));
    return { fixture, host, apply, listed };
  }

  // #97: dark error text was 4.15:1 on the base and 2.66:1 on the keyboard highlight, light error text 3.70:1 on a
  // selected row, and the raised error button's label 4.19:1 light and 3.21:1 dark, 2.37:1 dark under the pointer
  it('reads at 4.5:1 or more in every listed pair, in light and in dark', async () => {
    const { fixture, host, apply } = await render();
    const reds = new Set<string>();

    for (const mode of ['light', 'dark'] as const) {
      await apply(mode);
      const pairs = Array.from(host.querySelectorAll('.pair'), (element, i) => ({
        where: CONTRAST_PAIRS[i].where,
        text: getComputedStyle(element).color,
        background: getComputedStyle(element).backgroundColor,
      }));
      reds.add(pairs[0].text);

      expect(pairs.length).toBe(CONTRAST_PAIRS.length);
      const low = pairs
        .map(pair => ({ ...pair, ratio: contrast(pair.text, pair.background) }))
        .filter(pair => pair.ratio < 4.5)
        .map(pair => `${pair.where}: ${pair.ratio.toFixed(2)}, ${pair.text} on ${pair.background}`);
      expect(low, mode).toEqual([]);
      expect(await axeViolations(host), mode).toEqual([]);
    }

    // each theme's own red, so the dark readings are not the light ones again
    expect(reds.size).toBe(2);
    fixture.destroy();
  });

  // So the list holds every pair they draw, which the first test reads and the theming page shows
  it('draws its error text and its error buttons, at rest and under the pointer, in listed pairs', async () => {
    const { fixture, host, apply, listed } = await render();

    for (const mode of ['light', 'dark'] as const) {
      await apply(mode);
      const samples = [{ name: 'error text on the page', drawn: drawn(host.querySelector('.tab-error')!, getComputedStyle(document.body).backgroundColor) }];
      for (const button of Array.from(host.querySelectorAll('button'))) {
        const name = `the ${button.getAttribute('kind')} error button's label`;
        const atRest = drawn(button);
        await userEvent.hover(button);
        // the pointer's own colours, so the button reads apart from at rest
        const underPointer = await vi.waitFor(() => {
          expect(drawn(button)).not.toBe(atRest);
          return drawn(button);
        });
        await movePointerAway();
        samples.push({ name, drawn: atRest }, { name: `${name} under the pointer`, drawn: underPointer });
      }

      expect(samples.length).toBe(5);
      expect(
        samples.filter(sample => !listed().includes(sample.drawn)).map(sample => `${sample.name}: ${sample.drawn}`),
        mode,
      ).toEqual([]);
    }
    fixture.destroy();
  });
});
