import { computed } from '@angular/core';
import type { ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FormArrayValuePipe } from '../../pipes/value/form-array-value.pipe';
import { MetaImpl } from '../abstract-control/meta/impl';
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

  // A meta refresh walked the whole subtree and every descendant's change refreshed every ancestor, so
  // markAllAsTouched on N rows cost N squared; a refresh now reads each child's current meta
  it("refreshes an array from its rows' metas, without walking their subtrees", () => {
    const array = fb.array(Array.from({ length: 50 }, (_, i) => row(`row ${i}`)));
    const built = vi.spyOn(MetaImpl, 'fromControl');

    array.metaFn.markAllAsTouched();

    expect(array.$meta().childControls?.every(rowMeta => rowMeta.touched)).toBe(true);
    // one for each of the array, its 50 rows and their 50 fields, and a few to spare
    expect(built.mock.calls.length).toBeLessThan(110);
    built.mockRestore();
  });

  // valueChange's controls are the rows its value holds: the FormArray changed, and emitted, before the child list did
  it('gives valueChange the rows its value holds on push, insert and removeAt', () => {
    const array = fb.array([row('a')]);
    const seen: [number, number][] = [];
    array.registerFn.valueChange((value, _old, controls) => seen.push([value.length, controls.length]));

    array.push(row('c'));
    array.insert(1, row('b'));
    array.removeAt(0, true);

    expect(seen).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [2, 2],
    ]);
  });

  // With emitEvent: false Angular changes the FormArray's status, and its parents', without an event, so their metas
  // kept the old validity
  it('keeps the raw value and the metas in step when rows change without an event', () => {
    const form = fb.group<{ items: Row[] }>({ items: fb.array([row('a')]) });
    const items = form.controls.items;

    items.push(row('', Validators.required), { emitEvent: false });
    expect(items.$rawValue()).toEqual([{ name: 'a' }, { name: '' }]);
    expect(items.$meta().validity).toBe('INVALID');
    expect(form.$meta().validity).toBe('INVALID');

    items.removeAt(1, true, { emitEvent: false });
    expect(items.$meta().validity).toBe('VALID');
    expect(form.$meta().validity).toBe('VALID');
  });

  // F7: removeAt emitted the array's meta before its child list changed, so a removed row's error stayed
  it("drops a removed row's error from the array's meta", () => {
    const array = fb.array([row('a'), row('', Validators.required)]);
    array.at(1)!.controls.name.metaFn.markAsTouched(true);
    expect(array.$meta().hasError('required')).toBe(true);

    array.removeAt(1, true);

    expect(array.$meta().hasError('required')).toBe(false);
  });

  // disable() and enable() passed Angular onlySelf: true by default, so the array kept a disabled row in its value
  it("leaves a disabled row out of the array's value, and takes it in again when enabled", () => {
    const array = fb.array([row('a'), row('b')]);

    array.at(0)!.metaFn.disable();

    expect(array.$value()).toEqual([{ name: 'b' }]);

    array.at(0)!.metaFn.enable();

    expect(array.$value()).toEqual([{ name: 'a' }, { name: 'b' }]);
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

  // A subscriber that changed the array while its value emitted made Angular emit the new value inside that emit, so
  // the subscribers after it got the new value and then the old one
  it('gives every value subscriber the old value and then the new one when a subscriber changes the array', () => {
    const array = fb.array([fb.group<{ hasEmail: boolean; email: string }>({ hasEmail: fb.control<boolean>(true), email: fb.control<string>('ada') })]);
    const first: unknown[] = [];
    const second: unknown[] = [];
    array.registerFn.valueChange((value, _old, controls) => {
      first.push(value);
      controls.forEach(({ controls: { hasEmail, email } }) => (hasEmail.$value() ? email.metaFn.enable() : email.metaFn.disable()));
    });
    array.value$.subscribe(value => second.push(value));

    array.at(0)!.controls.hasEmail.setValue(false);

    expect(second).toEqual([[{ hasEmail: true, email: 'ada' }], [{ hasEmail: false, email: 'ada' }], [{ hasEmail: false }]]);
    expect(first).toEqual(second);
    expect(array.$value()).toEqual([{ hasEmail: false }]);
    expect(array.$rawValue()).toEqual([{ hasEmail: false, email: 'ada' }]);
  });

  // A held value the same as the last one was dropped though the raw value had changed, so the subscribers before the
  // one that pushed a disabled row never saw it
  it('calls the value subscribers again when one of them pushes a disabled row', () => {
    const array = fb.array([row('a')]);
    const rows: number[] = [];
    array.registerFn.valueChange((_value, _old, controls) => rows.push(controls.length));
    let adding = false;
    array.registerFn.valueChange(() => {
      if (adding) {
        adding = false;
        const hidden = row('hidden');
        hidden.metaFn.disable();
        array.push(hidden);
      }
    });

    adding = true;
    array.at(0)!.controls.name.setValue('b');

    expect(rows).toEqual([1, 1, 2]);
    expect(array.$value()).toEqual([{ name: 'b' }]);
    expect(array.$rawValue()).toEqual([{ name: 'b' }, { name: 'hidden' }]);
  });

  it('emits the value again when a rule sets a disabled field in a row, so the raw value follows', () => {
    const array = fb.array([fb.group<{ name: string; id: string }>({ name: fb.control<string>('ada'), id: fb.control<string>('', undefined, undefined, true) })]);
    array.registerFn.valueChange((_value, _old, controls) => {
      controls.forEach(({ controls: { name, id } }) => id.setValue(name.$value().toUpperCase()));
    });
    const raw: unknown[] = [];
    array.rawValue$.subscribe(value => raw.push(value));

    array.at(0)!.controls.name.setValue('bo');

    expect(array.$rawValue()).toEqual([{ name: 'bo', id: 'BO' }]);
    expect(raw.at(-1)).toEqual([{ name: 'bo', id: 'BO' }]);
  });
});
