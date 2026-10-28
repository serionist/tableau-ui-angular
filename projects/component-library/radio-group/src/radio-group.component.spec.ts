import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { TableauUiRadioGroupModule } from './tableau-ui-radio-group.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiRadioGroupModule, TableauUiCommonModule],
  template: `
    <tab-radio-group [formControl]="control" (valueChange)="changes.push($event)">
      <tab-option text="Small" icon="local_cafe" [value]="'s'" />
      <tab-option text="Medium" [value]="'m'" />
      <tab-option text="Large" hint="Not today" [value]="'l'" [disabled]="true" />
    </tab-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SizeComponent {
  readonly control = new FormControl<string | null>('s');
  readonly changes: unknown[] = [];
}

describe('RadioGroupComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(SizeComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const { control, changes } = fixture.componentInstance;
    const values: unknown[] = [];
    control.valueChanges.subscribe(value => values.push(value));
    return { fixture, host, control, changes, values, radios: Array.from(host.querySelectorAll('input')) };
  }

  it('selects an option from a click on its text, and from the arrow keys', async () => {
    const { fixture, host, control, values, radios } = await render();

    await userEvent.click(host.querySelectorAll('.radio-option .label')[1], { position: { x: 1, y: 1 } });
    await fixture.whenStable();
    expect(control.value).toBe('m');

    radios[1].focus();
    await userEvent.keyboard('{ArrowUp}');
    await fixture.whenStable();
    expect(control.value).toBe('s');
    expect(values).toEqual(['m', 's']);
    expect(radios[0].checked).toBe(true);
  });

  // F29: writeValue emitted (valueChange), so a handler ran on init and on every reset
  it('emits valueChange for a user pick, not for a form write', async () => {
    const { fixture, control, changes, radios } = await render();

    control.setValue('m');
    control.reset(null);
    await fixture.whenStable();
    expect(changes).toEqual([]);
    expect(radios.some(radio => radio.checked)).toBe(false);

    radios[1].click();
    await fixture.whenStable();
    expect(changes).toEqual(['m']);
  });

  // F31: Date values compared by reference, so an equal date written by the form selected nothing
  it('selects the option equal to a written date', async () => {
    @Component({
      imports: [ReactiveFormsModule, TableauUiRadioGroupModule, TableauUiCommonModule],
      template: `
        <tab-radio-group [formControl]="control">
          @for (day of days; track day.getTime()) {
            <tab-option [text]="day.toDateString()" [value]="day" />
          }
        </tab-radio-group>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class DayComponent {
      readonly days = [new Date(2026, 9, 28), new Date(2026, 9, 29)];
      readonly control = new FormControl<Date | null>(new Date(2026, 9, 29));
    }
    const fixture = TestBed.createComponent(DayComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const radios = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input'));
    expect(radios.map(radio => radio.checked)).toEqual([false, true]);
  });

  // The forms contract: touched on blur, not on a pick, as Angular's own radio buttons
  it('marks the control touched on blur', async () => {
    const { fixture, control, radios } = await render();

    radios[1].focus();
    radios[1].click();
    await fixture.whenStable();
    expect(control.touched).toBe(false);

    radios[1].blur();
    expect(control.touched).toBe(true);
  });

  it('passes axe', async () => {
    const { host } = await render();

    expect(await axeViolations(host)).toEqual([]);
  });
});
