import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiListModule } from './tableau-ui-list.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiListModule, TableauUiFormFieldModule, TableauUiCommonModule],
  template: `
    <tab-form-field>
      <tab-label>Country</tab-label>
      <tab-list-single-select [formControl]="country">
        <tab-option value="hu" text="Hungary" />
        <tab-option value="fr" text="France" [disabled]="true" />
        <tab-option value="de" text="Germany" />
      </tab-list-single-select>
    </tab-form-field>
    <tab-list-multi-select aria-label="Languages" [formControl]="languages">
      <tab-option value="en" text="English" />
      <tab-option value="hu" text="Hungarian" />
    </tab-list-multi-select>
    <button type="button">Next</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TravelComponent {
  readonly country = new FormControl<string | null>(null);
  readonly languages = new FormControl<string[] | null>(['hu']);
}

// A list longer than the box an app's layout gives it, which scrolls
@Component({
  imports: [ReactiveFormsModule, TableauUiListModule, TableauUiCommonModule],
  template: `
    <tab-list-multi-select aria-label="Countries" style="display: block; height: 80px" [formControl]="countries">
      @for (name of names; track name) {
        <tab-option [value]="name" [text]="name" />
      }
    </tab-list-multi-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LongListComponent {
  readonly names = Array.from({ length: 20 }, (_, i) => `Country ${i + 1}`);
  readonly countries = new FormControl<string[] | null>([]);
}

describe('ListComponent', () => {
  // a pointer left over an option would highlight it
  beforeEach(movePointerAway);

  async function render() {
    const fixture = TestBed.createComponent(TravelComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const single = host.querySelector<HTMLElement>('tab-list-single-select')!;
    const multi = host.querySelector<HTMLElement>('tab-list-multi-select')!;
    const options = (list: HTMLElement) => Array.from(list.querySelectorAll<HTMLElement>('[role=option]'));
    const text = (option: Element | null | undefined) => option?.querySelector('.option-content')?.textContent.trim();
    // the option aria-activedescendant names
    const active = (list: HTMLElement) => text(document.getElementById(list.getAttribute('aria-activedescendant') ?? ''));
    return { fixture, host, single, multi, options, active, component: fixture.componentInstance };
  }

  // F95: no listbox semantics, so a screen reader could not tell it was a list, which option was picked, nor where the
  // highlight was
  it('is a listbox whose active descendant follows the highlight', async () => {
    const { fixture, host, single, options, active, component } = await render();

    expect(single.getAttribute('role')).toBe('listbox');
    expect(single.getAttribute('aria-labelledby')).toBe(host.querySelector('label')!.id);
    expect(single.getAttribute('aria-multiselectable')).toBeNull();
    expect(options(single).map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false']);
    expect(options(single).map(option => option.getAttribute('aria-disabled'))).toEqual([null, 'true', null]);

    single.focus();
    expect(single.getAttribute('aria-activedescendant')).toBeNull();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(single)).toBe('Hungary');

    // the disabled option is skipped
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(single)).toBe('Germany');

    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(component.country.value).toBe('de');
    expect(options(single).map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);

    single.blur();
    await fixture.whenStable();
    expect(single.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('is a multi-selectable listbox whose options say which are picked', async () => {
    const { fixture, multi, options, active, component } = await render();

    expect(multi.getAttribute('role')).toBe('listbox');
    expect(multi.getAttribute('aria-multiselectable')).toBe('true');
    expect(options(multi).map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'true']);

    // the first arrow starts from the picked option
    multi.focus();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active(multi)).toBe('Hungarian');

    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(component.languages.value).toEqual(['hu', 'en']);
    expect(active(multi)).toBe('English');
    expect(options(multi).map(option => option.getAttribute('aria-selected'))).toEqual(['true', 'true']);
  });

  it('reads as disabled when its form control is', async () => {
    const { fixture, multi, component } = await render();

    component.languages.disable();
    await fixture.whenStable();

    expect(multi.getAttribute('aria-disabled')).toBe('true');
    expect(multi.getAttribute('tabindex')).toBeNull();
  });

  // a click focused a disabled list, as a click focuses any element with a tabindex
  it('takes no focus from a click while disabled', async () => {
    const { fixture, multi, component } = await render();
    component.languages.disable();
    await fixture.whenStable();

    // forced, since Playwright clicks no element that says it is disabled; a user's pointer does
    await userEvent.click(multi.querySelector('.option-wrapper')!, { force: true });
    await fixture.whenStable();

    expect(document.activeElement).not.toBe(multi);
    expect(component.languages.value).toEqual(['hu']);
  });

  // leaving a disabled list marked it touched, so a required list showed its error the moment it was enabled
  it('stays untouched when it loses focus while disabled', async () => {
    const { fixture, multi, component } = await render();
    multi.focus();
    component.languages.disable();
    await fixture.whenStable();

    multi.blur();
    await fixture.whenStable();

    expect(document.activeElement).not.toBe(multi);
    expect(component.languages.touched).toBe(false);
  });

  // a disabled list's options let the pointer through, and its host does too, so the wheel scrolled something else
  it("lets the pointer and the wheel reach a disabled list's options", async () => {
    const fixture = TestBed.createComponent(LongListComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    fixture.componentInstance.countries.disable();
    await fixture.whenStable();
    const list = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-list-multi-select')!;
    const option = list.querySelectorAll<HTMLElement>('.option-wrapper')[1];
    const box = option.getBoundingClientRect();

    expect(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.option-wrapper')).toBe(option);
    await userEvent.wheel(option, { delta: { y: 100 } });
    await vi.waitFor(() => {
      expect(list.scrollTop).toBeGreaterThan(0);
    });
  });

  // F114: touched came with each pick, never on blur, so a required list the user tabbed past showed no error
  it('is touched when focus leaves it, not when an option is picked', async () => {
    const { fixture, host, single, component } = await render();

    await userEvent.click(single.querySelector('.option-wrapper')!);
    await fixture.whenStable();
    expect(component.country.value).toBe('hu');
    expect(document.activeElement).toBe(single);
    expect(component.country.touched).toBe(false);

    await userEvent.click(host.querySelector('button')!);
    await fixture.whenStable();
    expect(component.country.touched).toBe(true);
  });

  it('is touched when the user tabs past it', async () => {
    const { fixture, single, component } = await render();

    single.focus();
    await userEvent.tab();
    await fixture.whenStable();

    expect(component.country.touched).toBe(true);
    expect(component.country.dirty).toBe(false);
  });

  it('passes axe', async () => {
    const { fixture, single } = await render();
    single.focus();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();

    expect(await axeViolations(fixture.nativeElement as HTMLElement)).toEqual([]);
  });
});
