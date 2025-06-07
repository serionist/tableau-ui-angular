import type { BehaviorSubject } from 'rxjs';
export type ReadonlyBehaviorSubject<T> = Omit<BehaviorSubject<T>, 'next' | 'error' | 'complete'>;
