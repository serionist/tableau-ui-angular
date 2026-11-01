import { Validators } from '@angular/forms';
import { FormControlPipe } from '../../pipes/raw-controls/form-control.pipe';
import { FB } from '../fb';

describe('FC', () => {
  const fb = new FB();

  // F4: a change between two falsy values (null to 0) was dropped as "no change"
  it('reports a change from null to 0', () => {
    const control = fb.control<number | null>(null);
    const values: (number | null)[] = [];
    control.value$.subscribe(value => values.push(value));

    control.setValue(0);

    expect(control.$value()).toBe(0);
    expect(values).toEqual([null, 0]);
  });

  // F5: clearing a control to null reported the old value as the new one
  it('calls valueChange with null when the control is cleared', () => {
    const control = fb.control<string | null>('a');
    const calls: [string | null, string | null | undefined][] = [];
    control.registerFn.valueChange((value, oldValue) => calls.push([value, oldValue]));

    control.setValue(null);

    expect(calls).toEqual([
      ['a', undefined],
      [null, 'a'],
    ]);
  });

  // F6: alsoRunOnEnabled ran the callback again on every meta change, touched and dirty included
  it('runs valueChange again when the control is enabled, and not when it is touched or dirty', () => {
    const control = fb.control<string>('a');
    const values: string[] = [];
    control.registerFn.valueChange(value => values.push(value), true);

    control.metaFn.markAsTouched();
    control.metaFn.markAsDirty();
    expect(values).toEqual(['a']);

    control.metaFn.disable();
    control.metaFn.enable();
    expect(values).toEqual(['a', 'a']);
  });

  // F6: with alsoRunOnDisabled, an enabled control never ran the callback, not even the first time
  it('runs valueChange with alsoRunOnDisabled on an enabled control, and again when it is disabled', () => {
    const control = fb.control<string>('a');
    const values: string[] = [];
    control.registerFn.valueChange(value => values.push(value), false, true);
    expect(values).toEqual(['a']);

    control.setValue('b');
    control.metaFn.disable();

    expect(values).toEqual(['a', 'b', 'b']);
  });

  // F20: the first meta was computed before the default value was set, so valueIsDefault started false
  it('starts with valueIsDefault true', () => {
    const control = fb.control<string>('a');

    expect(control.$meta().valueIsDefault).toBe(true);
    expect(control.meta$.value.valueIsDefault).toBe(true);
  });

  // The validator functions returned Angular's own control, typed as this one, so a chained call after them threw
  it('returns itself from its validator functions, so calls chain', () => {
    const control = fb.control<string>('');

    expect(control.validatorFn.setValidators(Validators.required)).toBe(control);
    control.validatorFn.addValidators(Validators.minLength(3)).validatorFn.removeValidators(Validators.required).metaFn.markAsTouched();
    control.setValue('ab');

    expect(control.$meta().errors).toEqual({ minlength: { requiredLength: 3, actualLength: 2 } });
    expect(control.$meta().touched).toBe(true);
    expect(control.validatorFn.clearValidators()).toBe(control);
  });

  // markAsDirty and markAsPristine checked the meta, which a call with emitEvent false leaves as it was, so the next
  // call did nothing: the meta still said pristine after markAsDirty(false), and markAsPristine() left the control dirty
  it.each([true, false])('marks a control pristine after markAsDirty(%s)', emitEvent => {
    const control = fb.control<string>('a');
    const angularControl = new FormControlPipe().transform(control);

    control.metaFn.markAsDirty(emitEvent);
    control.metaFn.markAsPristine();

    expect(angularControl.pristine).toBe(true);
    expect(control.$meta().pristine).toBe(true);
    expect(control.meta$.value.dirty).toBe(false);
  });

  it.each([true, false])('marks a control dirty after markAsPristine(%s)', emitEvent => {
    const control = fb.control<string>('a');
    const angularControl = new FormControlPipe().transform(control);
    control.metaFn.markAsDirty();

    control.metaFn.markAsPristine(emitEvent);
    control.metaFn.markAsDirty();

    expect(angularControl.dirty).toBe(true);
    expect(control.$meta().dirty).toBe(true);
    expect(control.meta$.value.pristine).toBe(false);
  });
});
