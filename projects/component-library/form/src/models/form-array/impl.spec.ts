import { computed } from '@angular/core';
import type { ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FormArrayValuePipe } from '../../pipes/value/form-array-value.pipe';
import { FB } from '../fb';
import type { FG } from '../form-group/interfaces';

type Row = {
  name: string;
};

describe('FA', () => {
  const fb = new FB();

  function row(name: string, validator?: ValidatorFn): FG<Row> {
    return fb.group<Row>({ name: fb.control<string>(name, validator) });
  }

  // F8: push, insert and removeAt set the same array again, so a computed over $controls or $childList never updated
  it('notifies readers of $controls and $childList on push, insert and removeAt', () => {
    const rows = [row('a')];
    const array = fb.array(rows);
    const names = computed(() => array.$controls().map(control => control.controls.name.$value()));
    const children = computed(() => array.hierarchy.$childList().length);
    expect(names()).toEqual(['a']);

    array.push(row('c'));
    expect(names()).toEqual(['a', 'c']);
    array.insert(1, row('b'));
    expect(names()).toEqual(['a', 'b', 'c']);
    expect(children()).toBe(3);
    array.removeAt(0, true);
    expect(names()).toEqual(['b', 'c']);
    expect(children()).toBe(2);

    // and the array given to fb.array is the caller's own
    expect(rows.length).toBe(1);
  });

  // F7: removeAt emitted the array's meta before its child list changed, so a removed row's error stayed
  it("drops a removed row's error from the array's meta", () => {
    const array = fb.array([row('a'), row('', Validators.required)]);
    array.at(1)!.controls.name.metaFn.markAsTouched(true);
    expect(array.$meta().hasError('required')).toBe(true);

    array.removeAt(1, true);

    expect(array.$meta().hasError('required')).toBe(false);
  });

  // F9: the raw value changed only with the rows, never when a row was edited
  it('updates the raw value when a row is edited', () => {
    const array = fb.array([row('a')]);

    array.at(0)!.controls.name.setValue('b');

    expect(array.$rawValue()).toEqual([{ name: 'b' }]);
  });

  // F9: without an argument the pipe returned that stale raw value
  it('formArrayValue gives the value without disabled fields, and the raw value when asked', async () => {
    const array = fb.array([fb.group<{ name: string; id: string }>({ name: fb.control<string>('a'), id: fb.control<string>('1', undefined, undefined, true) })]);
    const pipe = new FormArrayValuePipe();
    array.at(0)!.controls.name.setValue('b');

    expect(await firstValueFrom(pipe.transform(array))).toEqual([{ name: 'b' }]);
    expect(await firstValueFrom(pipe.transform(array, 'raw'))).toEqual([{ name: 'b', id: '1' }]);
  });
});
