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
});
