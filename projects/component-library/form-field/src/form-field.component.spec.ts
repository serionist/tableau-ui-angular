import type { Type } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableauUiChipControlModule } from 'tableau-ui-angular/chip-control';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
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
    } finally {
      delete globals.ngServerMode;
      vi.unstubAllGlobals();
    }
  });

  it('passes axe', async () => {
    const { host } = await render(NameFieldComponent);

    expect(await axeViolations(host)).toEqual([]);
  });
});
