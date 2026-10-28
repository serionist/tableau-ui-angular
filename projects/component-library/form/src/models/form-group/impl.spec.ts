import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FormGroupValuePipe } from '../../pipes/value/form-group-value.pipe';
import { TableauUiFormModule } from '../../tableau-ui-form.module';
import { FB } from '../fb';
import type { FG } from './interfaces';

type Address = {
  country: string | null;
  state: string | null;
};

describe('FG', () => {
  const fb = new FB();

  function address(): FG<Address> {
    return fb.group<Address>({ country: fb.control<string | null>('US'), state: fb.control<string | null>(null) });
  }

  // F6: alsoRunOnEnabled ran the callback on every meta change of the group, so typing in state reset it
  it('runs childChange with alsoRunOnEnabled when the child changes, not when a sibling does', () => {
    const group = address();
    group.registerFn.childChange(
      controls => controls.country,
      g => g.controls.state.setValue(null),
      true,
    );

    group.controls.state.setValue('WA');
    group.controls.state.metaFn.markAsDirty();
    expect(group.controls.state.$value()).toBe('WA');

    group.controls.country.setValue('CA');
    expect(group.controls.state.$value()).toBeNull();
  });

  // F7: markAllAsTouched emits the group's event before its children are touched, so the group's meta kept them untouched
  it("shows a child's error in the group's meta after markAllAsTouched", () => {
    const group = fb.group<{ name: string }>({ name: fb.control<string>('', Validators.required) });
    expect(group.$meta().hasError('required')).toBe(false);

    group.metaFn.markAllAsTouched();

    expect(group.$meta().hasError('required')).toBe(true);
    expect(group.meta$.value.hasError('required')).toBe(true);
  });

  // F22: without an argument the pipe returned the raw value, disabled fields included, typed as the value
  it('formGroupValue gives the value without disabled fields, and the raw value when asked', async () => {
    const group = fb.group<{ name: string; id: string }>({ name: fb.control<string>('Ada'), id: fb.control<string>('7', undefined, undefined, true) });
    const pipe = new FormGroupValuePipe();

    expect(await firstValueFrom(pipe.transform(group))).toEqual({ name: 'Ada' });
    expect(await firstValueFrom(pipe.transform(group, 'raw'))).toEqual({ name: 'Ada', id: '7' });
  });

  // F15: submitted$ waited for a DOM SubmitEvent, which Angular never puts on a form's events
  it('emits submitted$ when its form is submitted', async () => {
    @Component({
      imports: [ReactiveFormsModule, TableauUiFormModule],
      template: `<form [formGroup]="group | formGroup"><button type="submit">Save</button></form>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SubmitHostComponent {
      readonly group = address();
    }
    const fixture = TestBed.createComponent(SubmitHostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const submitted: unknown[] = [];
    fixture.componentInstance.group.submitted$.subscribe(value => submitted.push(value));

    (fixture.nativeElement as HTMLElement).querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(submitted).toEqual([{ country: 'US', state: null }]);
  });
});
