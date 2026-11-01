import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { ThemeService } from './theme.service';

// Each surface the library draws error text on, and the property it paints that surface with
const SURFACES = [
  { name: 'the base', property: '--twc-color-base' }, // the page, a dialog's body, an input
  { name: 'a selected row', property: '--twc-color-primary-light' }, // a table's selected row
  { name: 'the keyboard highlight', property: '--twc-color-highlight' }, // a list's, a select's, an autocomplete's, a menu's
  { name: "a modal's header", property: '--twc-modal-color-header' },
];

// The library's styles, as an app imports them, with its error text on each surface and its two error buttons
@Component({
  imports: [TableauUiButtonModule, TableauUiCommonModule],
  template: `
    @for (surface of surfaces; track surface.name) {
      <div [attr.data-surface]="surface.name" [style.background-color]="'var(' + surface.property + ')'">
        <tab-error>Required</tab-error>
      </div>
    }
    <button color="error" kind="raised">Delete</button>
    <button color="error" kind="stroked">Remove</button>
  `,
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SurfacesComponent {
  protected readonly surfaces = SURFACES;
}

// A computed colour's red, green and blue. Each must be opaque: a see-through one would need what lies under it, and an
// unstyled element's transparent background fails here rather than reading as black
function channels(colour: string): number[] {
  const [red, green, blue, alpha = 1] = (colour.match(/[\d.]+/g) ?? []).map(Number);
  expect(alpha, colour).toBe(1);
  return [red, green, blue];
}

// WCAG's contrast ratio of two colours, from their relative luminance
function contrast(text: string, background: string): number {
  const luminance = (colour: string) => {
    const [r, g, b] = channels(colour).map(value => (value / 255 <= 0.04045 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(text), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
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

  // #97: dark error text was 4.15:1 on the base and 2.66:1 on the keyboard highlight, light error text 3.70:1 on a
  // selected row, and the raised error button's label 4.19:1 light and 3.21:1 dark
  it("reads at 4.5:1 or more: error text on each surface, and the error buttons' labels, in light and in dark", async () => {
    const fixture = TestBed.createComponent(SurfacesComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const theme = TestBed.inject(ThemeService);
    theme.initialize();
    const reds = new Set<string>();

    for (const mode of ['light', 'dark'] as const) {
      theme.setColorMode(mode);
      await fixture.whenStable();
      expect(document.documentElement.classList.contains('dark-mode'), mode).toBe(mode === 'dark');

      const pairs = [
        ...Array.from(host.querySelectorAll<HTMLElement>('[data-surface]'), surface => ({
          name: `error text on ${surface.dataset['surface']}`,
          text: getComputedStyle(surface.querySelector('.tab-error')!).color,
          background: getComputedStyle(surface).backgroundColor,
        })),
        ...Array.from(host.querySelectorAll<HTMLElement>('button'), button => ({
          name: `the ${button.getAttribute('kind')} error button's label`,
          text: getComputedStyle(button).color,
          background: getComputedStyle(button).backgroundColor,
        })),
      ];
      reds.add(pairs[0].text);

      expect(pairs.map(pair => pair.name)).toEqual([...SURFACES.map(surface => `error text on ${surface.name}`), "the raised error button's label", "the stroked error button's label"]);
      const low = pairs
        .map(pair => ({ ...pair, ratio: contrast(pair.text, pair.background) }))
        .filter(pair => pair.ratio < 4.5)
        .map(pair => `${pair.name}: ${pair.ratio.toFixed(2)}, ${pair.text} on ${pair.background}`);
      expect(low, mode).toEqual([]);
      expect(await axeViolations(host), mode).toEqual([]);
    }

    // each theme's own red, so the dark readings are not the light ones again
    expect(reds.size).toBe(2);
    fixture.destroy();
  });
});
