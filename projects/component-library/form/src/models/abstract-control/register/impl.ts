import type { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import type { AC } from '../interfaces';
import type { RegisterFns } from './interfaces';
import type { Meta } from '../meta/interfaces';

export class RegisterFnsImpl<TChild> implements RegisterFns<TChild> {
  constructor(
    private readonly fgControl: AC,
    protected subscriptions: Subscription[],
  ) {}

  enableChange(callback: (enabled: boolean) => void): TChild {
    this.subscriptions.push(
      this.fgControl.meta$
        .pipe(
          map(e => e.enabled),
          distinctUntilChanged(),
        )
        .subscribe(e => {
          callback(e);
        }),
    );
    return this.fgControl as unknown as TChild;
  }

  metaChange(callback: (meta: Meta) => void): TChild {
    this.subscriptions.push(
      this.fgControl.meta$.subscribe(meta => {
        callback(meta);
      }),
    );
    return this.fgControl as unknown as TChild;
  }
  alwaysDisabled(): TChild {
    this.fgControl.metaFn.disable();
    this.subscriptions.push(
      this.fgControl.meta$.subscribe(meta => {
        if (meta.enabled) {
          this.fgControl.metaFn.disable();
        }
      }),
    );
    return this.fgControl as unknown as TChild;
  }
}
