import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { config, firstValueFrom, skip } from 'rxjs';
import { FormGroupPipe } from '../../pipes/raw-controls/form-group.pipe';
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

  // The check walks every level: a control two levels down, marked dirty alone, leaves both groups pristine
  it('marks a dirty control two levels down pristine', () => {
    const form = fb.group<{ address: Address }>({ address: address() });
    const { state } = form.controls.address.controls;
    state.metaFn.markAsDirty();
    expect(form.$meta().pristine).toBe(true);
    expect(form.controls.address.$meta().pristine).toBe(true);

    form.metaFn.markAsPristine();

    expect(state.$meta().pristine).toBe(true);
  });

  type Email = {
    hasEmail: boolean;
    email: string;
  };

  // The rule from the issue: the first subscriber disables email while the form's value is emitting
  function emailForm(first: unknown[]): FG<Email> {
    const form = fb.group<Email>({ hasEmail: fb.control<boolean>(true), email: fb.control<string>('ada') });
    const { email } = form.controls;
    form.registerFn.valueChange(value => {
      first.push(value);
      if (value.hasEmail) {
        email.metaFn.enable();
      } else {
        email.metaFn.disable();
      }
    });
    return form;
  }

  // A subscriber that changed the form while its value emitted made Angular emit the new value inside that emit, so the
  // subscribers after it got the new value and then the old one, and a template kept showing the disabled field
  it('gives every value subscriber the old value and then the new one when a subscriber changes the form', () => {
    const first: unknown[] = [];
    const second: unknown[] = [];
    const form = emailForm(first);
    form.value$.subscribe(value => second.push(value));

    form.controls.hasEmail.setValue(false);

    expect(second).toEqual([{ hasEmail: true, email: 'ada' }, { hasEmail: false, email: 'ada' }, { hasEmail: false }]);
    expect(first).toEqual(second);
    expect(form.$value()).toEqual({ hasEmail: false });
    expect(form.$rawValue()).toEqual({ hasEmail: false, email: 'ada' });

    form.controls.hasEmail.setValue(true);

    expect(second.slice(3)).toEqual([{ hasEmail: true }, { hasEmail: true, email: 'ada' }]);
    expect(first).toEqual(second);
    expect(form.$value()).toEqual({ hasEmail: true, email: 'ada' });
  });

  it('emits a change once when no subscriber changes the form', () => {
    const second: unknown[] = [];
    const form = emailForm([]);
    form.value$.subscribe(value => second.push(value));

    form.controls.email.setValue('bo');

    expect(second).toEqual([
      { hasEmail: true, email: 'ada' },
      { hasEmail: true, email: 'bo' },
    ]);
  });

  // reset$ read the value value$ had emitted, and a reset made inside a value subscriber waits for its turn there
  it('gives reset$ the reset value when a value subscriber resets the form', () => {
    const form = fb.group<{ name: string }>({ name: fb.control<string>('Ada') });
    form.registerFn.valueChange(value => {
      if (value.name === 'clear') {
        form.resetWithDefaultValue();
      }
    });
    const resets: unknown[] = [];
    const values: unknown[] = [];
    form.reset$.subscribe(value => resets.push(value));
    form.value$.subscribe(value => values.push(value));

    form.controls.name.setValue('clear');

    expect(resets).toEqual([{ name: 'Ada' }]);
    expect(values).toEqual([{ name: 'Ada' }, { name: 'clear' }, { name: 'Ada' }]);
    expect(form.$value()).toEqual({ name: 'Ada' });
  });

  // A rule that sets a field from the others, with no check that the field already holds it, makes Angular emit an
  // equal value each time: it recursed until the stack overflowed, and taking turns would loop
  it('settles a rule that sets a field from the others without a check', () => {
    const form = fb.group<{ first: string; last: string; full: string }>({ first: fb.control<string>('Ada'), last: fb.control<string>('King'), full: fb.control<string>('') });
    form.registerFn.valueChange(value => form.controls.full.setValue(`${value.first} ${value.last}`));
    const values: unknown[] = [];
    form.value$.subscribe(value => values.push(value));

    form.controls.first.setValue('Augusta');

    expect(values).toEqual([
      { first: 'Ada', last: 'King', full: 'Ada King' },
      { first: 'Augusta', last: 'King', full: 'Ada King' },
      { first: 'Augusta', last: 'King', full: 'Augusta King' },
    ]);
    expect(form.$value()).toEqual({ first: 'Augusta', last: 'King', full: 'Augusta King' });
  });

  // A held value the same as the last one still goes out when the raw value changed, as when a rule sets a disabled field
  it('emits a held value the same as the last one when the raw value changed, so the raw value follows', () => {
    const form = fb.group<{ name: string; id: string }>({ name: fb.control<string>('ada'), id: fb.control<string>('', undefined, undefined, true) });
    form.registerFn.valueChange(value => form.controls.id.setValue((value.name ?? '').toUpperCase()));
    const raw: unknown[] = [];
    form.rawValue$.subscribe(value => raw.push(value));

    form.controls.name.setValue('bo');

    expect(form.$rawValue()).toEqual({ name: 'bo', id: 'BO' });
    expect(raw.at(-1)).toEqual({ name: 'bo', id: 'BO' });
  });

  /** The errors RxJS reports from inside a subscription while `act` runs, which it reports on a timeout */
  async function reported(act: () => void): Promise<unknown[]> {
    const errors: unknown[] = [];
    config.onUnhandledError = error => errors.push(error);
    try {
      act();
      await new Promise(resolve => setTimeout(resolve));
    } finally {
      config.onUnhandledError = null;
    }
    return errors;
  }

  // A rule that changes the form each time it runs never settles: it overflowed the stack, and taking turns without a
  // cap froze the page with nothing logged
  it('stops a value rule that never settles after 100 held runs, reports it, and goes on working', async () => {
    const form = fb.group<{ count: number; name: string }>({ count: fb.control<number>(0), name: fb.control<string>('Ada') });
    let counting = false;
    form.registerFn.valueChange(value => {
      if (counting) {
        form.controls.count.setValue((value.count ?? 0) + 1);
      }
    });
    const values: unknown[] = [];
    form.value$.subscribe(value => values.push(value));

    counting = true;
    const errors = await reported(() => form.controls.name.setValue('Bo'));
    counting = false;

    expect(errors).toEqual([expect.objectContaining({ message: expect.stringContaining('value$ emitted 100 held changes in one turn') })]);
    expect(values.length).toBe(102);
    form.controls.name.setValue('Cy');
    expect(form.$value()).toEqual({ count: 101, name: 'Cy' });
    expect(values.at(-1)).toEqual({ count: 101, name: 'Cy' });
  });

  it('stops a meta rule that never settles after 100 held runs, reports it, and goes on working', async () => {
    const form = address();
    let toggling = false;
    form.registerFn.metaChange(meta => {
      if (toggling) {
        if (meta.touched) {
          form.metaFn.markAsUntouched();
        } else {
          form.metaFn.markAsTouched();
        }
      }
    });

    toggling = true;
    const errors = await reported(() => form.metaFn.markAsTouched());
    toggling = false;

    expect(errors).toEqual([expect.objectContaining({ message: expect.stringContaining('meta$ emitted 100 held changes in one turn') })]);
    form.controls.state.setValue('WA');
    expect(form.$meta().touched).toBe(new FormGroupPipe().transform(form).touched);
  });
});
