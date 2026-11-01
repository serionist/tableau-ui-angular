import type { Type } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { page, userEvent } from 'vitest/browser';
import { TableauUiChipControlModule } from 'tableau-ui-angular/chip-control';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiListModule } from 'tableau-ui-angular/list';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { axeViolations } from '../../testing/axe';
import { TableauUiFormFieldModule } from './tableau-ui-form-field.module';

const imports = [TableauUiFormFieldModule, TableauUiCommonModule];

async function render(component: Type<unknown>) {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host, label: host.querySelector('label')! };
}

describe('FormFieldComponent', () => {
  // F11: <label for> pointed at the select's host, which a label can't name, and the select then replaced the id
  it('names a select by its label', async () => {
    @Component({
      imports: [...imports, TableauUiSelectModule],
      template: `
        <tab-form-field>
          <tab-label>Country</tab-label>
          <tab-single-select><tab-option value="us" text="United States" /></tab-single-select>
        </tab-form-field>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SelectFieldComponent {}
    const { host, label } = await render(SelectFieldComponent);

    const select = host.querySelector('tab-single-select')!;
    expect(label.id).not.toBe('');
    expect(select.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.textContent.trim()).toBe('Country');
  });

  // F11: the chip control's search input, the element it focuses, got no name at all
  it("names a chip control's search input by its label", async () => {
    @Component({
      imports: [...imports, TableauUiChipControlModule],
      template: `
        <tab-form-field>
          <tab-label>Tags</tab-label>
          <tab-chip-control #chips [getValuesByKeys]="getValues">
            <ng-template let-ctx [tabChipTemplate]="chips">{{ ctx.data.value }}</ng-template>
          </tab-chip-control>
        </tab-form-field>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChipFieldComponent {
      readonly getValues = async () => Promise.resolve([]);
    }
    const { host, label } = await render(ChipFieldComponent);

    expect(host.querySelector('tab-chip-control input')!.getAttribute('aria-labelledby')).toBe(label.id);
  });

  // F25: the field replaced the input's own id, breaking the app's selectors and labels
  it("keeps an input's own id and points the label at it", async () => {
    @Component({
      imports,
      template: `<tab-form-field><tab-label>Email</tab-label><input id="email" type="email" /></tab-form-field>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class EmailFieldComponent {}
    const { host, label } = await render(EmailFieldComponent);

    expect(host.querySelector('input')!.id).toBe('email');
    expect(label.htmlFor).toBe('email');
  });

  // F26: a native select was not found, so its label pointed at nothing
  it('names a native select by its label', async () => {
    @Component({
      imports,
      template: `
        <tab-form-field>
          <tab-label>Size</tab-label>
          <select>
            <option>Small</option>
          </select>
        </tab-form-field>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SizeFieldComponent {}
    const { host, label } = await render(SizeFieldComponent);

    const select = host.querySelector('select')!;
    expect(select.id).not.toBe('');
    expect(label.htmlFor).toBe(select.id);
    expect(select.labels[0]).toBe(label);
  });

  // F26: with a prefix and no control it found, the field styled null and threw on init
  it('renders a prefix with no control to pad', async () => {
    @Component({
      imports,
      template: `<tab-form-field><tab-prefix>$</tab-prefix><span>Read only</span></tab-form-field>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ReadOnlyFieldComponent {}

    const { host } = await render(ReadOnlyFieldComponent);

    expect(host.textContent).toContain('Read only');
  });

  @Component({
    imports,
    template: `
      <tab-form-field>
        <tab-label>Name</tab-label>
        <tab-prefix>@</tab-prefix>
        <input type="text" />
        <tab-hint>As on your passport</tab-hint>
      </tab-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class NameFieldComponent {}

  // The server has no observers: the field created them while rendering, so a page with one could not prerender
  it('renders on the server without creating an observer', async () => {
    const created: string[] = [];
    const recorder = (name: string) =>
      class {
        constructor() {
          created.push(name);
        }
        observe() {
          // records only
        }
        disconnect() {
          // records only
        }
      };
    const globals = globalThis as { ngServerMode?: boolean };
    vi.stubGlobal('MutationObserver', recorder('MutationObserver'));
    vi.stubGlobal('ResizeObserver', recorder('ResizeObserver'));
    vi.stubGlobal('IntersectionObserver', recorder('IntersectionObserver'));
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { host, label } = await render(NameFieldComponent);

      expect(created).toEqual([]);
      expect(label.htmlFor).toBe(host.querySelector('input')!.id);
      // the description is in the first HTML: the effect that writes it runs on the server too
      expect(host.querySelector('input')!.getAttribute('aria-describedby')).toBe(host.querySelector('tab-hint')!.parentElement!.id);
    } finally {
      delete globals.ngServerMode;
      vi.unstubAllGlobals();
    }
  });

  it('passes axe', async () => {
    const { host } = await render(NameFieldComponent);

    expect(await axeViolations(host)).toEqual([]);
  });

  @Component({
    imports,
    template: `
      <tab-form-field style="width: 300px">
        <tab-label>Price</tab-label>
        <tab-prefix><span style="display: inline-block; width: 30px">$</span></tab-prefix>
        <input type="text" />
        <tab-suffix><span style="display: inline-block; width: 50px">USD</span></tab-suffix>
        <tab-hint [showOnError]="$hintOnError()">Before tax</tab-hint>
        @if ($invalid()) {
          <tab-error>Too high</tab-error>
        }
      </tab-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class PriceFieldComponent {
    readonly $invalid = signal(false);
    readonly $hintOnError = signal(false);
  }

  it('keeps the text in its input clear of the prefix and the suffix', async () => {
    const { host } = await render(PriceFieldComponent);
    const input = host.querySelector('input')!;
    const box = (selector: string) => host.querySelector(selector)!.getBoundingClientRect();

    await vi.waitFor(() => {
      const style = getComputedStyle(input);
      expect(box('input').left + parseFloat(style.paddingLeft)).toBeGreaterThanOrEqual(box('tab-prefix span').right);
      expect(box('input').right - parseFloat(style.paddingRight)).toBeLessThanOrEqual(box('tab-suffix span').left);
    });
  });

  it('shows the error in place of the hint, and with it when the hint shows on error', async () => {
    const { fixture, host } = await render(PriceFieldComponent);
    const price = fixture.componentInstance as PriceFieldComponent;
    const shown = () => Array.from(host.querySelectorAll('.form-extra-info > *'), element => element.textContent.trim());
    expect(shown()).toEqual(['Before tax']);

    price.$invalid.set(true);
    await fixture.whenStable();
    expect(shown()).toEqual(['Too high']);

    price.$hintOnError.set(true);
    await fixture.whenStable();
    expect(shown()).toEqual(['Before tax', 'Too high']);
    expect(await axeViolations(host)).toEqual([]);
  });

  // #52: the hint and the error were not linked to the control, so a screen reader on the control read neither
  describe('describes the control it names', () => {
    abstract class DescribedField {
      readonly $invalid = signal(false);
      readonly $hintOnError = signal(false);
    }

    @Component({
      imports,
      template: `
        <tab-form-field>
          <tab-label>Name</tab-label>
          <input type="text" aria-describedby="app-note" />
          <tab-hint [showOnError]="$hintOnError()">The hint</tab-hint>
          @if ($invalid()) {
            <tab-error>The error</tab-error>
          }
        </tab-form-field>
        <p id="app-note">The app's note</p>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class InputFieldComponent extends DescribedField {}

    @Component({
      imports: [...imports, TableauUiSelectModule],
      template: `
        <tab-form-field>
          <tab-label>Country</tab-label>
          <tab-single-select aria-describedby="app-note"><tab-option value="us" text="United States" /></tab-single-select>
          <tab-hint [showOnError]="$hintOnError()">The hint</tab-hint>
          @if ($invalid()) {
            <tab-error>The error</tab-error>
          }
        </tab-form-field>
        <p id="app-note">The app's note</p>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SelectFieldComponent extends DescribedField {}

    @Component({
      imports: [...imports, TableauUiListModule],
      template: `
        <tab-form-field>
          <tab-label>Country</tab-label>
          <tab-list-single-select aria-describedby="app-note"><tab-option value="us" text="United States" /></tab-list-single-select>
          <tab-hint [showOnError]="$hintOnError()">The hint</tab-hint>
          @if ($invalid()) {
            <tab-error>The error</tab-error>
          }
        </tab-form-field>
        <p id="app-note">The app's note</p>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ListFieldComponent extends DescribedField {}

    // The chip control's search input is the library's, so it has no id of the app's
    @Component({
      imports: [...imports, TableauUiChipControlModule],
      template: `
        <tab-form-field>
          <tab-label>Tags</tab-label>
          <tab-chip-control #chips [getValuesByKeys]="getValues">
            <ng-template let-ctx [tabChipTemplate]="chips">{{ ctx.data.value }}</ng-template>
          </tab-chip-control>
          <tab-hint [showOnError]="$hintOnError()">The hint</tab-hint>
          @if ($invalid()) {
            <tab-error>The error</tab-error>
          }
        </tab-form-field>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChipFieldComponent extends DescribedField {
      readonly getValues = async () => Promise.resolve([]);
    }

    it.each([
      { name: 'a native input', component: InputFieldComponent, selector: 'input', app: ["The app's note"] },
      { name: 'a select', component: SelectFieldComponent, selector: 'tab-single-select', app: ["The app's note"] },
      { name: 'a list', component: ListFieldComponent, selector: 'tab-list-single-select', app: ["The app's note"] },
      { name: "a chip control's search input", component: ChipFieldComponent, selector: 'tab-chip-control input', app: [] },
    ])('describes $name by the hint, then the error, as each shows, invalid only while the error shows', async ({ component, selector, app }) => {
      const { fixture, host } = await render(component);
      const field = fixture.componentInstance as DescribedField;
      const control = host.querySelector<HTMLElement>(selector)!;
      // the text of each element the control's aria-describedby names, in its order
      const describedBy = () => (control.getAttribute('aria-describedby') ?? '').split(' ').filter(id => id !== '');
      const description = () => describedBy().map(id => document.getElementById(id)?.textContent.trim());
      const invalid = () => control.getAttribute('aria-invalid');

      expect(description()).toEqual([...app, 'The hint']);
      await expect.element(control).toHaveAccessibleDescription([...app, 'The hint'].join(' '));
      expect(invalid()).toBeNull();

      // the error shows in the hint's place
      field.$invalid.set(true);
      await fixture.whenStable();
      expect(description()).toEqual([...app, 'The error']);
      expect(invalid()).toBe('true');

      // and with it, after it, when the hint shows on error
      field.$hintOnError.set(true);
      await fixture.whenStable();
      expect(description()).toEqual([...app, 'The hint', 'The error']);
      await expect.element(control).toHaveAccessibleDescription([...app, 'The hint', 'The error'].join(' '));
      expect(invalid()).toBe('true');
      expect(await axeViolations(host)).toEqual([]);

      field.$invalid.set(false);
      await fixture.whenStable();
      expect(description()).toEqual([...app, 'The hint']);
      expect(invalid()).toBeNull();
    });

    @Component({
      imports,
      template: `
        <tab-form-field>
          <tab-label>Code</tab-label>
          <input type="text" />
          @if ($error()) {
            <tab-error>{{ $error() }}</tab-error>
          }
        </tab-form-field>
        <button type="button">Elsewhere</button>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class CodeFieldComponent {
      readonly $error = signal('');
    }

    it('says an error that appears or changes with focus in the field, and not one that appears with focus elsewhere', async () => {
      const { fixture, host } = await render(CodeFieldComponent);
      const code = fixture.componentInstance as CodeFieldComponent;
      const [input, elsewhere] = [host.querySelector('input')!, host.querySelector('button')!];
      const region = host.querySelector('tab-form-field [aria-live="polite"]')!;
      // the field hears each change through an observer, after the render
      const show = async (error: string) => {
        code.$error.set(error);
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));
      };
      expect(region.textContent).toBe('');

      input.focus();
      await show('Too short');
      expect(region.textContent).toBe('Too short');
      await show('Digits only');
      expect(region.textContent).toBe('Digits only');
      // an error that goes takes its words out
      await show('');
      expect(region.textContent).toBe('');

      // with focus elsewhere it stays quiet: the error describes the input, so the user hears it on coming back
      elsewhere.focus();
      await show('Too short');
      expect(region.textContent).toBe('');
      await expect.element(input).toHaveAccessibleDescription('Too short');

      input.focus();
      await show('Digits only');
      expect(region.textContent).toBe('Digits only');
      expect(await axeViolations(host)).toEqual([]);

      // leaving the field empties the region, so reading the page later doesn't find the error twice
      elsewhere.focus();
      expect(region.textContent).toBe('');
    });

    // An app that focuses the first invalid field after a submit, as the docs say, did so before the field's observer
    // heard the new error, so the error was read as the description and then again by the region
    it('says nothing in the region for an error that shows when focus arrives, which the description says', async () => {
      const { fixture, host } = await render(CodeFieldComponent);
      const code = fixture.componentInstance as CodeFieldComponent;
      const input = host.querySelector('input')!;
      const region = host.querySelector('tab-form-field [aria-live="polite"]')!;

      // the submit: the error shows, and the app focuses the field once it has rendered
      code.$error.set('Too short');
      afterNextRender(
        () => {
          input.focus();
        },
        { injector: fixture.componentRef.injector },
      );
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve));
      expect(document.activeElement).toBe(input);
      expect(region.textContent).toBe('');
      await expect.element(input).toHaveAccessibleDescription('Too short');

      // a change while focus stays in the field is still said
      code.$error.set('Digits only');
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve));
      expect(region.textContent).toBe('Digits only');
    });

    // The region was positioned against the page: in a scrolling box with no position of its own, its place below the
    // fold made the whole page scroll
    it("adds nothing to the page's scroll height from below the fold of a scrolling box", async () => {
      @Component({
        imports,
        template: `
          <div style="height: 100px; overflow: auto">
            <div style="height: 3000px"></div>
            @if ($field()) {
              <tab-form-field>
                <tab-label>Name</tab-label>
                <input type="text" />
                <tab-error>Too short</tab-error>
              </tab-form-field>
            }
          </div>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class FoldComponent {
        readonly $field = signal(false);
      }
      const { fixture, host } = await render(FoldComponent);
      const scrollHeight = () => document.scrollingElement!.scrollHeight;
      const without = scrollHeight();

      (fixture.componentInstance as FoldComponent).$field.set(true);
      await fixture.whenStable();

      expect(host.querySelector('tab-form-field [aria-live="polite"]')).not.toBeNull();
      expect(scrollHeight()).toBe(without);
    });

    // An app's own bound attribute rewrote the whole attribute, which wiped the field's ids until its hint or error
    // next changed
    it("writes its part again when an app's own binding rewrites the control's attributes", async () => {
      @Component({
        imports: [...imports, TableauUiListModule],
        template: `
          <h4 id="heading">Travel</h4>
          <p id="note-a">The first note</p>
          <p id="note-b">The second note</p>
          <tab-form-field>
            <tab-label>Country</tab-label>
            <tab-list-single-select [attr.aria-describedby]="$note()" [attr.aria-labelledby]="$heading()" [attr.aria-invalid]="$invalid()">
              <tab-option value="us" text="United States" />
            </tab-list-single-select>
            <tab-error>Pick a country</tab-error>
          </tab-form-field>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class BoundFieldComponent {
        readonly $note = signal('note-a');
        readonly $heading = signal<string | null>(null);
        readonly $invalid = signal<string | null>(null);
      }
      const { fixture, host, label } = await render(BoundFieldComponent);
      const bound = fixture.componentInstance as BoundFieldComponent;
      const list = host.querySelector('tab-list-single-select')!;
      const errorId = host.querySelector('tab-error')!.parentElement!.id;
      expect(list.getAttribute('aria-describedby')).toBe(`note-a ${errorId}`);
      expect(list.getAttribute('aria-labelledby')).toBe(label.id);
      expect(list.getAttribute('aria-invalid')).toBe('true');

      bound.$note.set('note-b');
      bound.$heading.set('heading');
      bound.$invalid.set('false');
      await fixture.whenStable();
      // the field hears the rewrite through an observer
      await new Promise(resolve => setTimeout(resolve));

      expect(list.getAttribute('aria-describedby')).toBe(`note-b ${errorId}`);
      expect(list.getAttribute('aria-labelledby')).toBe(`heading ${label.id}`);
      expect(list.getAttribute('aria-invalid')).toBe('true');
    });

    // #53: the group's options read as loose radios, with nothing that said what they answer
    it("names a radio group by the field's label, and describes it by the field's hint", async () => {
      @Component({
        imports: [...imports, TableauUiRadioGroupModule],
        template: `
          <tab-form-field>
            <tab-label>Size</tab-label>
            <tab-radio-group>
              <tab-option text="Small" [value]="'s'" />
              <tab-option text="Large" [value]="'l'" />
            </tab-radio-group>
            <tab-hint>Sizes run large</tab-hint>
          </tab-form-field>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class SizeFieldComponent {}
      const { host } = await render(SizeFieldComponent);

      const group = page.getByRole('radiogroup', { name: 'Size', exact: true }).element();
      expect(group).toBe(host.querySelector('tab-radio-group'));
      await expect.element(group).toHaveAccessibleDescription('Sizes run large');
      expect(await axeViolations(host)).toEqual([]);
    });

    it("adds its label to a control's own aria-labelledby", async () => {
      @Component({
        imports: [...imports, TableauUiListModule],
        template: `
          <h4 id="app-heading">Travel</h4>
          <tab-form-field>
            <tab-label>Country</tab-label>
            <tab-list-single-select aria-labelledby="app-heading"><tab-option value="us" text="United States" /></tab-list-single-select>
          </tab-form-field>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TravelFieldComponent {}
      const { host, label } = await render(TravelFieldComponent);

      expect(host.querySelector('tab-list-single-select')!.getAttribute('aria-labelledby')).toBe(`app-heading ${label.id}`);
    });
  });

  // #114: the touched invalid control's rule outranked the focus rule, and inputs have no outline, so a keyboard user
  // couldn't see which field they were in. A chip control's focus is on its search input, so its host never matched
  describe('shows focus on a touched invalid control', () => {
    // The input before the field holds focus first: a text input always shows its focus, and Tab carries that on
    abstract class InvalidField {
      readonly control = new FormControl<unknown>(null, Validators.required);
    }

    @Component({
      imports,
      template: `
        <input type="text" aria-label="Before" />
        <tab-form-field>
          <tab-label>Email</tab-label>
          <input type="email" [formControl]="control" />
          <tab-error>Required</tab-error>
        </tab-form-field>
      `,
      // the library's styles, as an app imports them, in the page while it is rendered
      styleUrl: '../../styles/lib-styles.scss',
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class InputComponent extends InvalidField {}

    @Component({
      imports: [...imports, TableauUiSelectModule],
      template: `
        <input type="text" aria-label="Before" />
        <tab-form-field>
          <tab-label>Country</tab-label>
          <tab-single-select [formControl]="control"><tab-option value="us" text="United States" /></tab-single-select>
          <tab-error>Required</tab-error>
        </tab-form-field>
      `,
      styleUrl: '../../styles/lib-styles.scss',
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SelectComponent extends InvalidField {}

    @Component({
      imports: [...imports, TableauUiListModule],
      template: `
        <input type="text" aria-label="Before" />
        <tab-form-field>
          <tab-label>Country</tab-label>
          <tab-list-single-select [formControl]="control"><tab-option value="us" text="United States" /></tab-list-single-select>
          <tab-error>Required</tab-error>
        </tab-form-field>
      `,
      styleUrl: '../../styles/lib-styles.scss',
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ListComponent extends InvalidField {}

    @Component({
      imports: [...imports, TableauUiChipControlModule],
      template: `
        <input type="text" aria-label="Before" />
        <tab-form-field>
          <tab-label>Tags</tab-label>
          <tab-chip-control #chips [formControl]="control" [getValuesByKeys]="getValues">
            <ng-template let-ctx [tabChipTemplate]="chips">{{ ctx.data.value }}</ng-template>
          </tab-chip-control>
          <tab-error>Required</tab-error>
        </tab-form-field>
      `,
      styleUrl: '../../styles/lib-styles.scss',
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChipsComponent extends InvalidField {
      readonly getValues = async () => Promise.resolve([]);
    }

    it.each([
      { name: 'an input', component: InputComponent, focused: 'tab-form-field input', ringed: 'tab-form-field input' },
      { name: 'a select', component: SelectComponent, focused: 'tab-single-select', ringed: 'tab-single-select' },
      { name: 'a list', component: ListComponent, focused: 'tab-list-single-select', ringed: 'tab-list-single-select' },
      { name: 'a chip control', component: ChipsComponent, focused: 'tab-chip-control input', ringed: 'tab-chip-control' },
    ])('on $name: the red border stays, and a ring inside it stands 3:1 against the page in both themes', async ({ component, focused, ringed }) => {
      const { fixture, host } = await render(component);
      (fixture.componentInstance as InvalidField).control.markAsTouched();
      fixture.componentRef.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      const [before, target, styled] = [host.querySelector<HTMLElement>('input[aria-label="Before"]')!, host.querySelector<HTMLElement>(focused)!, host.querySelector<HTMLElement>(ringed)!];
      expect(styled.matches('.ng-invalid.ng-touched')).toBe(true);
      const root = document.documentElement;

      try {
        for (const dark of [false, true]) {
          root.classList.toggle('dark-mode', dark);
          before.focus();
          await userEvent.keyboard('{Tab}');
          expect(document.activeElement).toBe(target);
          expect(target.matches(':focus-visible')).toBe(true);
          const style = getComputedStyle(styled);

          // the red border, the error's colour, stays
          expect(style.borderTopColor).toBe(getComputedStyle(host.querySelector('.tab-error')!).color);
          expect(style.borderTopWidth).toBe('2px');
          // a solid ring, wholly inside the border with a gap between them, in a colour that stands against the page's
          expect(style.outlineStyle).toBe('solid');
          expect(style.outlineWidth).toBe('2px');
          expect(parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth)).toBeLessThan(-parseFloat(style.borderTopWidth));
          expect(contrast(style.outlineColor, getComputedStyle(root).backgroundColor)).toBeGreaterThanOrEqual(3);

          // and without focus, no ring
          await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
          expect(document.activeElement).toBe(before);
          expect(getComputedStyle(styled).outlineStyle).toBe('none');
        }
      } finally {
        root.classList.remove('dark-mode');
      }
    });
  });
});

// The contrast ratio of two computed colours, `rgb(r, g, b)`, as WCAG defines it
function contrast(first: string, second: string): number {
  const luminance = (color: string) => {
    const [r, g, b] = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(value => {
        const channel = Number(value) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
