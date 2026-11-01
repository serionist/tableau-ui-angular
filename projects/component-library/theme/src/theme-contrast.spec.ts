import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiListModule } from 'tableau-ui-angular/list';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import { axeViolations } from '../../testing/axe';
import { contrast } from '../../testing/contrast';
import { CONTRAST_PAIRS } from '../../testing/contrast-pairs';
import { movePointerAway } from '../../testing/pointer';
import { ThemeService } from './theme.service';

// The library's styles, as an app imports them: each listed pair, painted with its two properties, and the library's
// own error text, error buttons and primary on the page
@Component({
  imports: [ReactiveFormsModule, TableauUiButtonModule, TableauUiCheckboxModule, TableauUiCommonModule, TableauUiIconModule, TableauUiListModule, TableauUiRadioGroupModule],
  template: `
    @for (pair of pairs; track pair.where) {
      <div class="pair" [style.color]="'var(' + pair.text + ')'" [style.background-color]="'var(' + pair.background + ')'">{{ pair.where }}</div>
    }
    <tab-error>Required</tab-error>
    <button color="error" kind="raised">Delete</button>
    <button color="error" kind="stroked">Remove</button>
    <p class="text-primary">Primary text</p>
    <tab-icon value="info" color="primary" label="Info" />
    <button color="primary" kind="raised">Save</button>
    <button color="primary" kind="stroked">Open</button>
    <tab-checkbox [formControl]="remember">Remember me</tab-checkbox>
    <tab-radio-group aria-label="Size" [formControl]="size">
      <tab-option text="Small" [value]="'s'" />
      <tab-option text="Large" [value]="'l'" />
    </tab-radio-group>
    <tab-list-single-select aria-label="Country" [formControl]="country">
      <tab-option value="hu" text="Hungary" />
      <tab-option value="de" text="Germany" />
    </tab-list-single-select>
  `,
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ColoursComponent {
  protected readonly pairs = CONTRAST_PAIRS;
  protected readonly remember = new FormControl(true);
  protected readonly size = new FormControl('s');
  protected readonly country = new FormControl('hu');
}

// A text, a border or a ring colour on the background it is drawn on, as computed
function on(colour: string, background: string): string {
  return `${colour} on ${background}`;
}

// An element's text colour on its background, as computed
function drawn(element: Element, background = getComputedStyle(element).backgroundColor): string {
  return on(getComputedStyle(element).color, background);
}

// Hovers an element and reads what `read` gives once the pointer's own colours apply, so it reads apart from at rest
async function underPointer(element: Element, read: () => string, atRest: string): Promise<string> {
  await userEvent.hover(element);
  const hovered = await vi.waitFor(() => {
    expect(read()).not.toBe(atRest);
    return read();
  });
  await movePointerAway();
  return hovered;
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
  // selected row, and the raised error button's label 4.19:1 light and 3.21:1 dark, 2.37:1 dark under the pointer.
  // #133: the dark primary was 2.56:1 on the base as text, an icon, a border or a ring, and a raised primary button's
  // label 2.55:1 under the pointer
  it('reads at 4.5:1 or more in every listed pair, in light and in dark', async () => {
    const { fixture, host, apply } = await render();
    const shades = { error: new Set<string>(), primary: new Set<string>() };

    for (const mode of ['light', 'dark'] as const) {
      await apply(mode);
      const pairs = Array.from(host.querySelectorAll('.pair'), (element, i) => ({
        where: CONTRAST_PAIRS[i].where,
        property: CONTRAST_PAIRS[i].text,
        text: getComputedStyle(element).color,
        background: getComputedStyle(element).backgroundColor,
      }));
      shades.error.add(pairs.find(pair => pair.property === '--twc-color-error')!.text);
      shades.primary.add(pairs.find(pair => pair.property === '--twc-color-primary-on-base')!.text);

      expect(pairs.length).toBe(CONTRAST_PAIRS.length);
      const low = pairs
        .map(pair => ({ ...pair, ratio: contrast(pair.text, pair.background) }))
        .filter(pair => pair.ratio < 4.5)
        .map(pair => `${pair.where}: ${pair.ratio.toFixed(2)}, ${pair.text} on ${pair.background}`);
      expect(low, mode).toEqual([]);
      expect(await axeViolations(host), mode).toEqual([]);
    }

    // each theme's own red and primary on the base, so the dark readings are not the light ones again
    expect([shades.error.size, shades.primary.size]).toEqual([2, 2]);
    fixture.destroy();
  });

  // So the list holds every pair they draw, which the first test reads and the theming page shows
  it('draws its error text and its error buttons, at rest and under the pointer, in listed pairs', async () => {
    const { fixture, host, apply, listed } = await render();

    for (const mode of ['light', 'dark'] as const) {
      await apply(mode);
      const samples = [{ name: 'error text on the page', drawn: drawn(host.querySelector('.tab-error')!, getComputedStyle(document.body).backgroundColor) }];
      for (const button of Array.from(host.querySelectorAll('button[color="error"]'))) {
        const name = `the ${button.getAttribute('kind')} error button's label`;
        const atRest = drawn(button);
        samples.push({ name, drawn: atRest }, { name: `${name} under the pointer`, drawn: await underPointer(button, () => drawn(button), atRest) });
      }

      expect(samples.length).toBe(5);
      expect(
        samples.filter(sample => !listed().includes(sample.drawn)).map(sample => `${sample.name}: ${sample.drawn}`),
        mode,
      ).toEqual([]);
    }
    fixture.destroy();
  });

  // #133: the dark primary was 2.56:1 on the base, so the theme draws it there in a colour of its own; the list holds
  // each pair the library draws it in, which the first test reads and the theming page shows
  it('draws the primary as text, an icon, a border and a ring, and its primary buttons, at rest and under the pointer, in listed pairs', async () => {
    const { fixture, host, apply, listed } = await render();
    const page = () => getComputedStyle(document.body).backgroundColor;
    const stroked = host.querySelector<HTMLElement>('button[color="primary"][kind="stroked"]')!;
    // a box's ring, shown while its input has focus from the keyboard
    const ring = (control: string) => {
      const box = host.querySelector(`${control} input:focus-visible + .box`)!;
      expect(getComputedStyle(box).outlineStyle).toBe('solid');
      return on(getComputedStyle(box).outlineColor, page());
    };

    for (const mode of ['light', 'dark'] as const) {
      await apply(mode);
      const samples = [
        { name: 'primary text on the page', drawn: drawn(host.querySelector('.text-primary')!, page()) },
        { name: 'a primary icon on the page', drawn: drawn(host.querySelector('tab-icon.primary')!, page()) },
      ];
      for (const button of Array.from(host.querySelectorAll('button[color="primary"]'))) {
        const name = `the ${button.getAttribute('kind')} primary button's label`;
        const atRest = drawn(button);
        samples.push({ name, drawn: atRest }, { name: `${name} under the pointer`, drawn: await underPointer(button, () => drawn(button), atRest) });
      }
      const border = () => on(getComputedStyle(stroked).borderTopColor, getComputedStyle(stroked).backgroundColor);
      const borderAtRest = border();
      samples.push(
        { name: "the stroked primary button's border", drawn: borderAtRest },
        { name: "the stroked primary button's border under the pointer", drawn: await underPointer(stroked, border, borderAtRest) },
      );

      // from the stroked button, Tab reaches the checkbox, then the radio group's checked option
      stroked.focus();
      await userEvent.tab();
      samples.push({ name: "the checkbox's focus ring", drawn: ring('tab-checkbox') });
      await userEvent.tab();
      samples.push({ name: "the radio button's focus ring", drawn: ring('tab-radio-group') });
      (document.activeElement as HTMLElement).blur();

      const list = host.querySelector('tab-list-single-select')!;
      const selected = list.querySelector('.option-wrapper.selected')!;
      samples.push({ name: "the list's selected option's outline", drawn: on(getComputedStyle(selected).outlineColor, getComputedStyle(list).backgroundColor) });

      expect(samples.length).toBe(11);
      expect(
        samples.filter(sample => !listed().includes(sample.drawn)).map(sample => `${sample.name}: ${sample.drawn}`),
        mode,
      ).toEqual([]);
    }
    fixture.destroy();
  });
});
