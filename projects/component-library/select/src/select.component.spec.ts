import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { axeViolations } from '../../testing/axe';
import { TableauUiSelectModule } from './tableau-ui-select.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiSelectModule, TableauUiFormFieldModule, TableauUiCommonModule],
  template: `
    <tab-form-field>
      <tab-label>Country</tab-label>
      @if ($shown()) {
        <tab-single-select placeholder="Pick a country" [formControl]="country" [allowClear]="true">
          <tab-prefix><input aria-label="Search countries" /></tab-prefix>
          <tab-option value="hu" text="Hungary" />
          <tab-option value="fr" text="France" [disabled]="true" />
          <tab-option value="de" text="Germany" />
        </tab-single-select>
      }
    </tab-form-field>
    <tab-multi-select aria-label="Languages" [formControl]="languages">
      <tab-option value="en" text="English" />
      <tab-option value="hu" text="Hungarian" />
    </tab-multi-select>
    <button type="button">Next</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TravelComponent {
  country = new FormControl<string | null>(null);
  readonly languages = new FormControl<string[] | null>(['hu']);
  readonly $shown = signal(true);
}

describe('SelectComponent', () => {
  async function render(country?: FormControl<string | null>) {
    const fixture = TestBed.createComponent(TravelComponent);
    if (country) {
      fixture.componentInstance.country = country;
    }
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const select = host.querySelector<HTMLElement>('tab-single-select')!;
    const multi = host.querySelector<HTMLElement>('tab-multi-select')!;
    // the listbox a combobox controls, which the dropdown renders next to it
    const listbox = (combobox: HTMLElement) => document.getElementById(combobox.getAttribute('aria-controls') ?? '');
    const options = (combobox: HTMLElement) => Array.from(listbox(combobox)?.querySelectorAll<HTMLElement>('[role=option]') ?? []);
    const text = (option: Element | null | undefined) => option?.querySelector('.option-content')?.textContent.trim();
    const active = (combobox: HTMLElement) => text(document.getElementById(combobox.getAttribute('aria-activedescendant') ?? ''));
    // the open dropdown; one at a time
    const dropdown = () => document.querySelector<HTMLElement>('.dropdown-container');
    // the dialog service places a dropdown 10 ms after it opens
    const placed = async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      await fixture.whenStable();
    };
    return { fixture, host, select, multi, listbox, options, active, dropdown, placed, component: fixture.componentInstance };
  }

  // F38: the template passed the multi-select check uncalled, always truthy, so a single select never marked its option
  it('marks the option of its value as selected', async () => {
    const { fixture, select, options } = await render(new FormControl<string | null>('de'));

    select.click();
    await fixture.whenStable();

    const selected = options(select).filter(option => option.classList.contains('selected'));
    expect(selected.map(option => option.querySelector('.option-content')!.textContent.trim())).toEqual(['Germany']);
    expect(options(select).map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
  });

  // F41: no combobox or listbox semantics, so arrowing through the options announced nothing
  it('is a combobox whose listbox follows the highlight through aria-activedescendant', async () => {
    const { fixture, host, select, listbox, options, active, component } = await render();
    const label = host.querySelector('label')!;

    expect(select.getAttribute('role')).toBe('combobox');
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(select.getAttribute('aria-controls')).toBeNull();

    select.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(select.getAttribute('aria-expanded')).toBe('true');
    expect(listbox(select)?.getAttribute('role')).toBe('listbox');
    expect(listbox(select)?.getAttribute('aria-labelledby')).toBe(label.id);
    expect(options(select).map(option => option.getAttribute('aria-disabled'))).toEqual([null, 'true', null]);
    expect(select.getAttribute('aria-activedescendant')).toBeNull();

    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(select)).toBe('Hungary');

    // the disabled option is skipped
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(select)).toBe('Germany');

    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(component.country.value).toBe('de');
    expect(select.getAttribute('aria-expanded')).toBe('false');
    expect(select.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('is a multi-selectable listbox whose options say which are picked', async () => {
    const { fixture, multi, listbox, options, active, component } = await render();

    multi.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(listbox(multi)?.getAttribute('aria-multiselectable')).toBe('true');
    expect(listbox(multi)?.getAttribute('aria-label')).toBe('Languages');
    expect(options(multi).map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'true']);

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(component.languages.value).toEqual(['hu', 'en']);
    expect(active(multi)).toBe('English');
    expect(options(multi).map(option => option.getAttribute('aria-selected'))).toEqual(['true', 'true']);
  });

  // F35: touched came with each selection, never on blur, so a required select the user tabbed past showed no error
  it('is touched when focus leaves it, not when an option is picked', async () => {
    const { fixture, host, select, component } = await render();

    select.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(component.country.value).toBe('hu');
    expect(component.country.touched).toBe(false);

    host.querySelector<HTMLElement>('button[type=button]:not([layout])')!.focus();
    await fixture.whenStable();
    expect(component.country.touched).toBe(true);
  });

  it('stays open while focus is in its dropdown, and closes when focus leaves both', async () => {
    const { fixture, host, select, dropdown, component } = await render();

    select.click();
    await fixture.whenStable();
    const search = dropdown()!.querySelector('input')!;
    search.focus();
    await fixture.whenStable();
    expect(dropdown()).not.toBeNull();
    expect(component.country.touched).toBe(false);

    host.querySelector<HTMLElement>('button[type=button]:not([layout])')!.focus();
    await fixture.whenStable();
    expect(dropdown()).toBeNull();
    expect(component.country.touched).toBe(true);
  });

  // F51: the document keydown handler took Space from a text box in the dropdown and closed it
  it('lets a text box in its dropdown take a space', async () => {
    const { fixture, select, dropdown } = await render();

    select.click();
    await fixture.whenStable();
    const search = dropdown()!.querySelector('input')!;
    search.focus();
    await userEvent.keyboard('new zealand');
    await fixture.whenStable();

    expect(search.value).toBe('new zealand');
    expect(dropdown()).not.toBeNull();
  });

  // F49, and the server, which has no document: each select listened to the document's focusout for life
  it('renders without listening to the document', async () => {
    const listen = vi.spyOn(document, 'addEventListener');
    try {
      const { select } = await render();

      expect(select.textContent).toContain('Pick a country');
      expect(listen.mock.calls.map(([type]) => type)).toEqual([]);
    } finally {
      listen.mockRestore();
    }
  });

  // F50: the dropdown's place was taken once, at open, so it stayed behind when the select moved
  it('keeps its dropdown under it when the select moves', async () => {
    const { fixture, host, select, dropdown, placed } = await render();
    select.click();
    await placed();
    // the dropdown is fixed, at the left and top its inline style gives, in viewport pixels
    const place = () => {
      const { style } = dropdown()!.closest<HTMLElement>('.dialog-container')!;
      return { left: parseFloat(style.left), top: parseFloat(style.top) };
    };
    expect(place().left).toBeCloseTo(select.getBoundingClientRect().left, 0);

    host.style.display = 'block';
    host.style.padding = '40px 0 0 120px';
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    expect(place().left).toBeCloseTo(select.getBoundingClientRect().left, 0);
    expect(place().top).toBeCloseTo(select.getBoundingClientRect().bottom, 0);
  });

  // F52: an open dropdown outlived its select, backdrop included, after a route change
  it('closes its dropdown when it is destroyed', async () => {
    const { fixture, select, component } = await render();
    select.click();
    await fixture.whenStable();
    expect(document.querySelector('.dialog-backdrop')).not.toBeNull();

    component.$shown.set(false);
    await fixture.whenStable();

    expect(document.querySelector('.dropdown-container')).toBeNull();
    expect(document.querySelector('.dialog-backdrop')).toBeNull();
  });

  // F53: after reset() the value was null, which counted as a value, so the empty select showed a clear button
  it('shows no clear button after a reset', async () => {
    const { fixture, select, component } = await render(new FormControl<string | null>('hu'));
    expect(select.querySelector('button')).not.toBeNull();

    component.country.reset();
    await fixture.whenStable();

    expect(select.querySelector('button')).toBeNull();
    expect(select.textContent).toContain('Pick a country');
  });

  // F54: aria-disabled and aria-hidden were bound as properties, so a disabled select read as hidden, not disabled
  it('is announced as disabled, not hidden', async () => {
    const { fixture, select, component } = await render();

    component.country.disable();
    await fixture.whenStable();

    expect(select.getAttribute('aria-disabled')).toBe('true');
    expect(select.getAttribute('aria-hidden')).toBeNull();
  });

  it('passes axe, closed and open', async () => {
    const { fixture, host, select } = await render(new FormControl<string | null>('de'));
    expect(await axeViolations(host)).toEqual([]);

    select.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });
});
