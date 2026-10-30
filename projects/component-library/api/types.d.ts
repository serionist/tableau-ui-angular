// The public API of tableau-ui-angular/types, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import { BehaviorSubject } from 'rxjs';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Date ? T[P] : T[P] extends object ? (T[P] extends Function ? T[P] : DeepPartial<T[P]>) : T[P];
};

type Primitive = Date | boolean | number | string | null;

type ReadonlyBehaviorSubject<T> = Omit<BehaviorSubject<T>, 'complete' | 'error' | 'next'>;

export type { DeepPartial, Primitive, ReadonlyBehaviorSubject };
