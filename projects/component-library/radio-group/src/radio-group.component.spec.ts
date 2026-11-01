import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { page, userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { TableauUiRadioGroupModule } from './tableau-ui-radio-group.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiRadioGroupModule, TableauUiCommonModule],
  template: `
    <tab-radio-group aria-label="Size" aria-describedby="size-note" [formControl]="control" (valueChange)="changes.push($event)">
      <tab-option text="Small" icon="local_cafe" [value]="'s'" />
      <tab-option text="Medium" [value]="'m'" />
      <tab-option text="Large" hint="Not today" [value]="'l'" [disabled]="true" />
      @if ($invalid()) {
        <tab-error>Pick a size</tab-error>
      }
    </tab-radio-group>
    <p id="size-note">Sizes run large</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SizeComponent {
  readonly control = new FormControl<string | null>('s');
  readonly changes: unknown[] = [];
  readonly $invalid = signal(false);
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

  // A form's write set only the selection, so picking the same option after a reset emitted nothing
  it('emits valueChange for each pick, also the same option after a reset', async () => {
    const { fixture, control, changes, radios } = await render();

    radios[1].click();
    // a render between the pick and the reset, as an app has, so the radio's checked binding sees both
    await fixture.whenStable();
    control.reset(null);
    await fixture.whenStable();
    expect(radios[1].checked).toBe(false);
    radios[1].click();
    await fixture.whenStable();

    expect(changes).toEqual(['m', 'm']);
    expect(control.value).toBe('m');
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

  // #53: the options read as loose radios, with nothing that said they belong together or what they answer
  it('is a radiogroup named by its aria-label', async () => {
    const { host } = await render();

    expect(page.getByRole('radiogroup', { name: 'Size', exact: true }).element()).toBe(host.querySelector('tab-radio-group'));
  });

  // #52: the error was not linked to the group
  it("is described by its error while it shows, and invalid then, the app's own description kept", async () => {
    const { fixture, host } = await render();
    const group = host.querySelector<HTMLElement>('tab-radio-group')!;

    await expect.element(group).toHaveAccessibleDescription('Sizes run large');
    expect(group.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.$invalid.set(true);
    await fixture.whenStable();
    await expect.element(group).toHaveAccessibleDescription('Sizes run large Pick a size');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(await axeViolations(host)).toEqual([]);

    fixture.componentInstance.$invalid.set(false);
    await fixture.whenStable();
    expect(group.getAttribute('aria-describedby')).toBe('size-note');
    expect(group.hasAttribute('aria-invalid')).toBe(false);
  });

  // An app's own bound attribute rewrote the whole attribute, which wiped the group's error id until the error next
  // changed
  it("writes its error's id again when an app's own binding rewrites the host's aria-describedby", async () => {
    @Component({
      imports: [TableauUiRadioGroupModule, TableauUiCommonModule],
      template: `
        <tab-radio-group aria-label="Size" [attr.aria-describedby]="$note()">
          <tab-option text="Small" [value]="'s'" />
          <tab-error>Pick a size</tab-error>
        </tab-radio-group>
        <p id="note-a">The first note</p>
        <p id="note-b">The second note</p>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class BoundGroupComponent {
      readonly $note = signal('note-a');
    }
    const fixture = TestBed.createComponent(BoundGroupComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const group = (fixture.nativeElement as HTMLElement).querySelector('tab-radio-group')!;
    const errorId = group.querySelector('.extra-info')!.id;
    expect(group.getAttribute('aria-describedby')).toBe(`note-a ${errorId}`);

    fixture.componentInstance.$note.set('note-b');
    await fixture.whenStable();
    // the group hears the rewrite through an observer
    await new Promise(resolve => setTimeout(resolve));

    expect(group.getAttribute('aria-describedby')).toBe(`note-b ${errorId}`);
    expect(group.getAttribute('aria-invalid')).toBe('true');
  });

  it('passes axe', async () => {
    const { host } = await render();

    expect(await axeViolations(host)).toEqual([]);
  });
});
