import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { axeViolations } from '../../testing/axe';
import type { AutoCompleteComponent } from './autocomplete.component';
import { TableauUiAutoCompleteModule } from './tableau-ui-autocomplete.module';

@Component({
  imports: [TableauUiAutoCompleteModule, TableauUiFormFieldModule, TableauUiCommonModule],
  template: `
    <form (submit)="submits.push(1); $event.preventDefault()">
      <tab-form-field>
        <tab-label>From</tab-label>
        <input class="from" type="text" [tabAutoComplete]="cities" />
      </tab-form-field>
      <button type="submit">Search</button>
    </form>
    @if ($toShown()) {
      <input class="to" type="text" aria-label="To" [tabAutoComplete]="cities" />
    }
    <input class="fixed" type="text" aria-label="Home" readonly value="Vienna" [tabAutoComplete]="cities" />
    <label for="via">Via</label>
    <input id="via" class="via" type="text" [tabAutoComplete]="cities" />
    <label>Stop <input class="stop" type="text" [tabAutoComplete]="cities" /></label>
    <tab-autocomplete #cities>
      <tab-option value="Budapest" text="Budapest" />
      <tab-option value="Berlin" text="Berlin" [disabled]="true" />
      <tab-option value="Bern" text="Bern" />
    </tab-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TripComponent {
  readonly submits: number[] = [];
  readonly $toShown = signal(true);
}

describe('AutoCompleteComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(TripComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const input = (name: string) => host.querySelector<HTMLInputElement>(`input.${name}`)!;
    const listbox = (combobox: HTMLElement) => document.getElementById(combobox.getAttribute('aria-controls') ?? '');
    const active = (combobox: HTMLElement) =>
      document
        .getElementById(combobox.getAttribute('aria-activedescendant') ?? '')
        ?.querySelector('.option-content')
        ?.textContent.trim();
    // the open suggestions; one at a time
    const dropdown = () => document.querySelector<HTMLElement>('.dropdown-container');
    return { fixture, host, input, listbox, active, dropdown, component: fixture.componentInstance };
  }

  // F41: no combobox or listbox semantics, so arrowing through the suggestions announced nothing
  it('makes its input a combobox whose listbox follows the highlight through aria-activedescendant', async () => {
    const { fixture, host, input, listbox, active } = await render();
    const from = input('from');

    expect(from.getAttribute('role')).toBe('combobox');
    expect(from.getAttribute('aria-autocomplete')).toBe('list');
    expect(from.getAttribute('aria-expanded')).toBe('false');

    from.focus();
    await fixture.whenStable();
    expect(from.getAttribute('aria-expanded')).toBe('true');
    // another input sharing the suggestions is not the one they are open for
    expect(input('to').getAttribute('aria-expanded')).toBe('false');
    expect(listbox(from)?.getAttribute('role')).toBe('listbox');
    expect(listbox(from)?.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id);
    expect(from.getAttribute('aria-activedescendant')).toBeNull();

    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(from)).toBe('Budapest');
    expect(document.getElementById(from.getAttribute('aria-activedescendant')!)?.getAttribute('aria-selected')).toBe('true');

    // the disabled suggestion is skipped
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(from)).toBe('Bern');

    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(from.value).toBe('Bern');
    expect(from.getAttribute('aria-expanded')).toBe('false');
    expect(from.getAttribute('aria-controls')).toBeNull();
    expect(from.getAttribute('aria-activedescendant')).toBeNull();
  });

  // Round 1, B5: a label with no id, or one wrapped around the input, left the listbox without a name
  it('names its listbox by a label with no id, or one around the input', async () => {
    const { fixture, host, input, listbox } = await render();

    for (const [name, text] of [
      ['via', 'Via'],
      ['stop', 'Stop'],
    ]) {
      input(name).focus();
      await fixture.whenStable();
      expect(listbox(input(name))?.getAttribute('aria-label')).toBe(text);
      expect(await axeViolations(host)).toEqual([]);
    }
  });

  // Each opening starts with no suggestion highlighted, as the select's does
  it('opens with no suggestion highlighted', async () => {
    const { fixture, input } = await render();
    const from = input('from');
    from.focus();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(from.getAttribute('aria-activedescendant')).not.toBeNull();

    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();
    from.click();
    await fixture.whenStable();

    expect(from.getAttribute('aria-expanded')).toBe('true');
    expect(from.getAttribute('aria-activedescendant')).toBeNull();
  });

  // F44: every input sharing one autocomplete took each pick, and a removed input's subscription lived on
  it('writes a pick into the input it is open for only, and lets a removed input go', async () => {
    const { fixture, input, dropdown, component } = await render();
    const from = input('from');
    const to = input('to');

    to.focus();
    await fixture.whenStable();
    dropdown()!.querySelector<HTMLElement>('.option-wrapper')!.click();
    await fixture.whenStable();

    expect(to.value).toBe('Budapest');
    expect(from.value).toBe('');

    to.blur();
    component.$toShown.set(false);
    await fixture.whenStable();
    from.focus();
    await fixture.whenStable();
    dropdown()!.querySelectorAll<HTMLElement>('.option-wrapper')[2].click();
    await fixture.whenStable();

    expect(from.value).toBe('Bern');
    expect(to.value).toBe('Budapest');
  });

  // F55: Enter with no suggestion highlighted only closed the suggestions, so a search form never submitted on it
  it('lets Enter submit the form when no suggestion is highlighted', async () => {
    const { fixture, input, dropdown, component } = await render();

    input('from').focus();
    await fixture.whenStable();
    expect(dropdown()).not.toBeNull();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(component.submits).toEqual([1]);
    expect(dropdown()).toBeNull();
  });

  // F56: a read-only input still opened its suggestions, and a pick changed it
  it('offers no suggestions to a read-only input', async () => {
    const { fixture, input, dropdown } = await render();

    input('fixed').focus();
    input('fixed').click();
    await fixture.whenStable();

    expect(dropdown()).toBeNull();
    expect(input('fixed').getAttribute('aria-expanded')).toBe('false');
  });

  // F50: the suggestions' place was taken once, at open, so they stayed behind when the input moved
  it('keeps its suggestions under the input when it moves', async () => {
    const { fixture, host, input, dropdown } = await render();
    const from = input('from');
    from.focus();
    await new Promise(resolve => setTimeout(resolve, 20));
    await fixture.whenStable();
    // the dropdown is fixed, at the left and top its inline style gives, in viewport pixels
    const place = () => {
      const { style } = dropdown()!.closest<HTMLElement>('.dialog-container')!;
      return { left: parseFloat(style.left), top: parseFloat(style.top) };
    };
    expect(place().left).toBeCloseTo(from.getBoundingClientRect().left, 0);

    host.style.display = 'block';
    host.style.padding = '40px 0 0 120px';
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    expect(place().left).toBeCloseTo(from.getBoundingClientRect().left, 0);
    expect(place().top).toBeCloseTo(from.getBoundingClientRect().bottom, 0);
  });

  it('passes axe, closed and open', async () => {
    const { fixture, host, input } = await render();
    expect(await axeViolations(host)).toEqual([]);

    input('from').focus();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });
});

@Component({
  imports: [TableauUiAutoCompleteModule, TableauUiCommonModule],
  template: `
    @if ($shown()) {
      <input type="text" aria-label="City" [tabAutoComplete]="cities" />
    }
    <tab-autocomplete #cities>
      <tab-option value="Budapest" text="Budapest" />
    </tab-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CityComponent {
  readonly $shown = signal(true);
  readonly $cities = viewChild.required<AutoCompleteComponent<string>>('cities');
}

describe('AutoCompleteDirective', () => {
  // Round 1, B6, F44: a removed input kept its subscription to the suggestions it shared
  it('lets go of its suggestions when its input is removed, and closes them', async () => {
    const fixture = TestBed.createComponent(CityComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    (fixture.nativeElement as HTMLElement).querySelector('input')!.focus();
    await fixture.whenStable();
    expect(document.querySelector('.dropdown-container')).not.toBeNull();
    expect(component.$cities().selectValue$.observed).toBe(true);

    component.$shown.set(false);
    await fixture.whenStable();

    expect(document.querySelector('.dropdown-container')).toBeNull();
    expect(component.$cities().selectValue$.observed).toBe(false);
  });
});
