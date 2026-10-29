import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { cdp, server } from 'vitest/browser';
// cdp()'s send(), which the Playwright provider declares
import type {} from '@vitest/browser-playwright';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { axeViolations } from '../../testing/axe';
import { TableauUiDatePickerModule } from './tableau-ui-date-picker.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiDatePickerModule, TableauUiFormFieldModule, TableauUiCommonModule],
  template: `
    <tab-form-field>
      <tab-label>Start</tab-label>
      <input type="date" [formControl]="control" />
    </tab-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StartDateComponent {
  control = new FormControl<Date | null>(null);
}

@Component({
  imports: [TableauUiDatePickerModule],
  template: `
    <input type="date" aria-label="Day" [value]="$day()" (valueChange)="changes.push($event)" />
    <input type="datetime-local" aria-label="Meeting" (valueChange)="changes.push($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BoundDatesComponent {
  readonly $day = signal<Date | undefined>(new Date(2025, 2, 15));
  readonly changes: (Date | undefined)[] = [];
}

// What the browser does when the user picks or types a whole date
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DatePickerDirective', () => {
  async function render<T>(component: new () => T, before?: (instance: T) => void) {
    const fixture = TestBed.createComponent(component);
    before?.(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, instance: fixture.componentInstance, inputs: Array.from(host.querySelectorAll('input')) };
  }

  // F35: touched came on focus and on each input, before the change, so with updateOn: 'blur' a typed date was never
  // committed
  it('is touched on blur, which commits the date typed before it', async () => {
    const control = new FormControl<Date | null>(null, { updateOn: 'blur' });
    const { fixture, inputs } = await render(StartDateComponent, instance => (instance.control = control));

    inputs[0].focus();
    type(inputs[0], '2025-03-15');
    await fixture.whenStable();
    expect(control.touched).toBe(false);

    inputs[0].blur();
    await fixture.whenStable();

    expect(control.touched).toBe(true);
    expect(control.value).toEqual(new Date(2025, 2, 15));
  });

  // F36: a date was parsed as midnight UTC and written back with local getters, so west of UTC the form held the day
  // before. Chromium runs it in New York; Firefox in the machine's own time zone, which shows it anywhere but UTC.
  it('takes a typed date as that day at local midnight', async () => {
    if (server.browser === 'chromium') {
      await cdp().send('Emulation.setTimezoneOverride', { timezoneId: 'America/New_York' });
    }
    try {
      const { fixture, instance, inputs } = await render(StartDateComponent);

      type(inputs[0], '2025-03-15');
      await fixture.whenStable();

      expect(instance.control.value).toEqual(new Date(2025, 2, 15));
      instance.control.setValue(instance.control.value);
      await fixture.whenStable();
      expect(inputs[0].value).toBe('2025-03-15');
    } finally {
      if (server.browser === 'chromium') {
        await cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' });
      }
    }
  });

  // F37: the value input was taken from the native binding and never written to the element
  it('shows the value bound to it, and follows it', async () => {
    const { fixture, instance, inputs } = await render(BoundDatesComponent);

    expect(inputs[0].value).toBe('2025-03-15');

    instance.$day.set(new Date(2026, 0, 2));
    await fixture.whenStable();
    expect(inputs[0].value).toBe('2026-01-02');

    instance.$day.set(undefined);
    await fixture.whenStable();
    expect(inputs[0].value).toBe('');
  });

  it("shows the form's value, and sends the user's date to it", async () => {
    const { fixture, instance, inputs } = await render(StartDateComponent, component => (component.control = new FormControl<Date | null>(new Date(2025, 2, 15))));

    expect(inputs[0].value).toBe('2025-03-15');

    type(inputs[0], '2025-04-01');
    await fixture.whenStable();
    expect(instance.control.value).toEqual(new Date(2025, 3, 1));
    expect(instance.control.dirty).toBe(true);
  });

  // F62: datetime-local was matched, then rewritten to type="date", so no time could be entered
  it('keeps datetime-local, and takes its date and time', async () => {
    const { fixture, instance, inputs } = await render(BoundDatesComponent);

    expect(inputs[1].type).toBe('datetime-local');

    type(inputs[1], '2025-03-15T10:30');
    await fixture.whenStable();
    expect(instance.changes).toEqual([new Date(2025, 2, 15, 10, 30)]);
  });

  it('passes axe', async () => {
    const { host } = await render(StartDateComponent);

    expect(await axeViolations(host)).toEqual([]);
  });
});
