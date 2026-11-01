import type { AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

/** The held runs one turn takes before it gives up, as Angular gives up on change detection that never settles */
export const MAX_HELD_RUNS = 100;

/**
 * Runs one emit at a time. A value that comes while an emit runs, as when a subscriber changes the form, is held, and
 * once that emit has reached every subscriber the next one runs with it, so none of them ends on a stale value. Held
 * values merge, the latest by default, and a held value `same` finds equal to the one just emitted is dropped.
 *
 * After 100 held runs in one turn it drops what it holds and throws: a subscriber that changes the form each time it
 * is given a value may not settle within 100 rounds. The emits run inside Angular's own subscriptions, so RxJS reports
 * the throw as an uncaught error, as it did the stack overflow such a subscriber caused before the emits took turns.
 * An array's `push`, `insert`, `removeAt` and `clear` refresh the metas themselves, so from them a meta rule's error
 * reaches the caller.
 */
export class InTurn<T> {
  private running = false;
  // boxed, since a value can be undefined
  private held: { value: T } | undefined;

  constructor(
    private readonly name: string,
    private readonly merge: (held: T, value: T) => T = (_held, value) => value,
    private readonly same: (held: T, emitted: T) => boolean = () => false,
  ) {}

  /** What a running emit holds for the next one */
  get holding(): { value: T } | undefined {
    return this.held;
  }

  run(value: T, emit: (value: T) => void): void {
    if (this.running) {
      this.held = { value: this.held ? this.merge(this.held.value, value) : value };
      return;
    }
    this.running = true;
    try {
      let next: { value: T } | undefined = { value };
      for (let run = 0; next; run++) {
        if (run > MAX_HELD_RUNS) {
          throw new Error(
            `tableau-ui-angular/form: ${this.name} didn't settle within ${MAX_HELD_RUNS} rounds in one turn: a subscriber changes the form each time it is given a value. The last change was dropped. Give that subscriber a check that leaves the form as it is once it holds what the subscriber sets, or make the whole change in one call.`,
          );
        }
        const current = next.value;
        emit(current);
        next = this.take();
        if (next && this.same(next.value, current)) {
          next = undefined;
        }
      }
    } finally {
      this.running = false;
      this.held = undefined;
    }
  }

  private take(): { value: T } | undefined {
    const { held } = this;
    this.held = undefined;
    return held;
  }
}

/**
 * A `BehaviorSubject` whose emits take turns (`InTurn`). RxJS's own `next` hands a value that comes while it is
 * emitting to every subscriber at once, so the subscribers after the one that made the change got the old value last;
 * here each subscriber gets the same values in the same order.
 *
 * A held value the same as the one just emitted is dropped, so a rule that sets a field from the others settles, but
 * only while the control's raw value, status and errors are what they were when that one went out: a subscriber that
 * sets a disabled field, changes a validator or adds a disabled row gets the subscribers called again.
 */
export class InTurnSubject<T> extends BehaviorSubject<T> {
  private readonly turn: InTurn<T>;
  // the control's raw value, status and errors when the last value went out
  private emittedState: unknown;

  /** @param control The control whose value it emits; without one, a held value is compared alone */
  constructor(
    value: T,
    private readonly control?: AbstractControl,
  ) {
    super(value);
    this.turn = new InTurn<T>('value$', undefined, (held, emitted) => sameValue(held, emitted) && sameValue(this.state(), this.emittedState));
  }

  /** The value it holds, or the one waiting for its turn */
  get latest(): T {
    const held = this.turn.holding;
    return held ? held.value : this.value;
  }

  override next(value: T): void {
    this.turn.run(value, current => {
      this.emittedState = this.state();
      super.next(current);
    });
  }

  private state(): unknown {
    const { control } = this;
    return control ? { raw: control.getRawValue() as unknown, status: control.status, errors: control.errors } : undefined;
  }
}

/**
 * Whether two values a form holds are the same: equal primitives, `NaN` included, dates at the same time, and arrays
 * and plain objects whose items are the same. Anything else is the same only when it is the same object.
 */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b || Object.is(a, b)) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return Object.is(a.getTime(), b.getTime());
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    // by index, since every() skips the holes of a sparse array
    for (let i = 0; i < a.length; i++) {
      if (!sameValue(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && sameValue(a[key], b[key]));
  }
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
