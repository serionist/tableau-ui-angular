import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { TableauUiCheckboxModule } from './tableau-ui-checkbox.module';

@Component({
  imports: [ReactiveFormsModule, TableauUiCheckboxModule, TableauUiCommonModule],
  template: `
    <tab-checkbox [formControl]="control" [loading]="$loading()" (valueChange)="changes.push($event)">
      I accept the <button type="button">terms</button>
      <tab-hint>Required to continue</tab-hint>
      @if ($invalid()) {
        <tab-error>Accept the terms to go on</tab-error>
      }
    </tab-checkbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TermsComponent {
  readonly control = new FormControl<boolean | 'partial' | null>(false);
  readonly $loading = signal(false);
  readonly $invalid = signal(false);
  readonly changes: (boolean | 'partial')[] = [];
}

describe('CheckboxComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(TermsComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const { control, changes } = fixture.componentInstance;
    const values: unknown[] = [];
    control.valueChanges.subscribe(value => values.push(value));
    return { fixture, host, control, changes, values, input: host.querySelector('input')! };
  }

  // F12: the host's click and the input's change both toggled, so a click on the input itself toggled twice
  it('toggles once when the input itself is clicked, as assistive technology does', async () => {
    const { fixture, control, values, input } = await render();

    input.click();
    await fixture.whenStable();

    expect(control.value).toBe(true);
    expect(values).toEqual([true]);
    expect(input.checked).toBe(true);
    expect(control.dirty).toBe(true);
  });

  it('toggles from a click on its text, and from Space', async () => {
    const { fixture, host, control, values, input } = await render();

    await userEvent.click(host.querySelector('.label')!, { position: { x: 1, y: 1 } });
    await fixture.whenStable();
    expect(control.value).toBe(true);

    input.focus();
    await userEvent.keyboard(' ');
    await fixture.whenStable();
    expect(control.value).toBe(false);
    expect(values).toEqual([true, false]);
    expect(input.checked).toBe(false);
  });

  it('ignores a click while it is loading, and keeps the input in step', async () => {
    const { fixture, control, input } = await render();
    fixture.componentInstance.$loading.set(true);
    await fixture.whenStable();

    input.click();
    await fixture.whenStable();

    expect(control.value).toBe(false);
    expect(input.checked).toBe(false);
  });

  // F13: the text was a div, so the input had no name; 'partial' read as checked; disabled was not exposed
  it('names the input by its text, and exposes partial as mixed and disabled', async () => {
    const { fixture, control, input } = await render();

    expect(input.labels?.[0]?.textContent).toContain('I accept the');
    control.setValue('partial');
    await fixture.whenStable();
    expect(input.indeterminate).toBe(true);
    expect(input.checked).toBe(false);
    control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
  });

  // F29: writeValue emitted (valueChange), so a handler ran on init and on every reset
  it('emits valueChange for a user toggle, not for a form write', async () => {
    const { fixture, control, changes, input } = await render();

    control.setValue(true);
    control.reset(null);
    await fixture.whenStable();
    expect(changes).toEqual([]);
    expect(input.checked).toBe(false);

    input.click();
    await fixture.whenStable();
    expect(changes).toEqual([true]);
  });

  // A form's write set only what the box showed, so a model that already held the user's new value emitted nothing
  it('emits valueChange when the user unchecks a box the form checked', async () => {
    const { fixture, control, changes, input } = await render();
    control.setValue(true);
    await fixture.whenStable();

    input.click();
    await fixture.whenStable();

    expect(changes).toEqual([false]);
    expect(control.value).toBe(false);
  });

  // F30: a click anywhere inside toggled, so opening the terms ticked the box
  it('does not toggle when a button in its text is clicked', async () => {
    const { fixture, host, control } = await render();

    host.querySelector('button')!.click();
    await fixture.whenStable();

    expect(control.value).toBe(false);
  });

  // The forms contract: touched on blur, not on toggle, as Angular's own checkbox
  it('marks the control touched on blur', async () => {
    const { fixture, control, input } = await render();

    input.focus();
    input.click();
    await fixture.whenStable();
    expect(control.touched).toBe(false);

    input.blur();
    expect(control.touched).toBe(true);
  });

  // #52: the hint and the error were not linked to the input, so a screen reader on the input read neither
  it('is described by its hint, then by its error in its place, and invalid while the error shows', async () => {
    const { fixture, host, input } = await render();
    const terms = fixture.componentInstance;

    await expect.element(input).toHaveAccessibleDescription('Required to continue');
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    terms.$invalid.set(true);
    await fixture.whenStable();
    await expect.element(input).toHaveAccessibleDescription('Accept the terms to go on');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(await axeViolations(host)).toEqual([]);

    terms.$invalid.set(false);
    await fixture.whenStable();
    await expect.element(input).toHaveAccessibleDescription('Required to continue');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('passes axe', async () => {
    const { host } = await render();

    expect(await axeViolations(host)).toEqual([]);
  });
});
