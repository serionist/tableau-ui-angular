import { BehaviorSubject } from 'rxjs';

/**
 * A `BehaviorSubject` that emits one value at a time. A value that comes while it is emitting, as when a subscriber
 * changes the form, waits until every subscriber has the current one, and then the latest goes out. RxJS's own `next`
 * hands it to every subscriber at once, so the subscribers after the one that made the change got the old value last.
 * Each subscriber gets the same values in the same order; `refreshMeta` holds a meta change the same way.
 */
export class InTurnSubject<T> extends BehaviorSubject<T> {
  private emitting = false;
  // boxed, since the value can be undefined
  private pending: { value: T } | undefined;

  /** The value it holds, or the one waiting for its turn */
  get latest(): T {
    return this.pending ? this.pending.value : this.value;
  }

  override next(value: T): void {
    if (this.emitting) {
      this.pending = { value };
      return;
    }
    this.emitting = true;
    try {
      let next: { value: T } | undefined = { value };
      while (next) {
        this.pending = undefined;
        super.next(next.value);
        next = this.pending;
      }
    } finally {
      this.emitting = false;
      this.pending = undefined;
    }
  }
}
