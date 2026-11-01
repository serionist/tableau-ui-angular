import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, skip } from 'rxjs';
import { FormGroupValuePipe } from '../../pipes/value/form-group-value.pipe';
import { TableauUiFormModule } from '../../tableau-ui-form.module';
import { FB } from '../fb';
import type { FG } from './interfaces';

type Address = {
  country: string | null;
  state: string | null;
};

type Contact = {
  name: string;
  email: string;
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

  // A rule run on enable must see the group enabled after its children are: a child's meta made the group look enabled
  // in the middle of Angular's enable(), so the rule disabled state before the loop enabled it again
  it('runs an alsoRunOnEnabled rule after its group and all its children are enabled', () => {
    const group = fb.group<Address>({ country: fb.control<string | null>(null), state: fb.control<string | null>(null) });
    group.registerFn.childChange(
      controls => controls.country,
      (g, _control, country) => (country === null ? g.controls.state.metaFn.disable() : g.controls.state.metaFn.enable()),
      true,
    );
    expect(group.controls.state.$meta().disabled).toBe(true);

    group.metaFn.disable();
    group.metaFn.enable();

    expect(group.controls.state.$meta().disabled).toBe(true);
  });

  function contactForm(): FG<{ contact: Contact }> {
    return fb.group<{ contact: Contact }>({
      contact: fb.group<Contact>({ name: fb.control<string>('Ada'), email: fb.control<string>('', Validators.required) }),
    });
  }

  // disable() and enable() passed Angular onlySelf: true by default, so the groups above kept a disabled control in
  // their value and validity: a form whose only invalid field was disabled stayed invalid
  it("leaves a disabled control out of its ancestors' value and validity, and takes it in again when enabled", () => {
    const form = contactForm();
    const { contact } = form.controls;
    expect(form.$meta().validity).toBe('INVALID');

    contact.controls.email.metaFn.disable();

    expect(contact.$meta().validity).toBe('VALID');
    expect(contact.$value()).toEqual({ name: 'Ada' });
    expect(form.$meta().validity).toBe('VALID');
    expect(form.$value()).toEqual({ contact: { name: 'Ada' } });

    contact.controls.email.metaFn.enable();

    expect(contact.$meta().validity).toBe('INVALID');
    expect(form.$meta().validity).toBe('INVALID');
    expect(form.$value()).toEqual({ contact: { name: 'Ada', email: '' } });
  });

  // disable() called Angular's disable() a second time without emitEvent, so disable(false) still emitted
  it('emits no value or status change when emitEvent is false, and still updates the ancestors', () => {
    const form = contactForm();
    const { email } = form.controls.contact.controls;
    const emitted: string[] = [];
    email.meta$.pipe(skip(1)).subscribe(() => emitted.push('email meta'));
    form.value$.pipe(skip(1)).subscribe(() => emitted.push('form value'));

    email.metaFn.disable(false);

    expect(emitted).toEqual([]);
    // Angular emits a touched event on each ancestor whatever emitEvent says, so the form's meta has the new validity
    expect(form.$meta().validity).toBe('VALID');

    email.metaFn.enable(false);

    expect(emitted).toEqual([]);
    expect(form.$meta().validity).toBe('INVALID');
  });

  it('leaves the ancestors as they were when markAncestors is false, until their next update', () => {
    const form = contactForm();
    const { name, email } = form.controls.contact.controls;

    email.metaFn.disable(true, false);

    expect(email.$meta().disabled).toBe(true);
    expect(form.$meta().validity).toBe('INVALID');
    expect(form.$value()).toEqual({ contact: { name: 'Ada', email: '' } });

    name.setValue('Bo');

    expect(form.$meta().validity).toBe('VALID');
    expect(form.$value()).toEqual({ contact: { name: 'Bo' } });
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

  // markAsDirty and markAsPristine did nothing while the control itself was already marked, so a call that marks the
  // ancestors left them as they were
  it('marks the ancestors with markAncestors true, though the control is already dirty or pristine', () => {
    const group = address();
    const { state } = group.controls;

    state.metaFn.markAsDirty();
    expect(group.$meta().dirty).toBe(false);
    state.metaFn.markAsDirty(true, true);
    expect(group.$meta().dirty).toBe(true);

    state.metaFn.markAsPristine();
    expect(group.$meta().dirty).toBe(true);
    state.metaFn.markAsPristine(true, true);
    expect(group.$meta().pristine).toBe(true);
  });

  // markAsPristine did nothing on a pristine group, though a child marked dirty without its ancestors was still dirty
  it("marks a pristine group's dirty children pristine", () => {
    const group = address();
    group.controls.state.metaFn.markAsDirty();
    expect(group.$meta().pristine).toBe(true);

    group.metaFn.markAsPristine();

    expect(group.controls.state.$meta().pristine).toBe(true);
  });
});
