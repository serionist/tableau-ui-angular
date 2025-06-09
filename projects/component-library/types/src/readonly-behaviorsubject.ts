import type { BehaviorSubject } from 'rxjs';
export type ReadonlyBehaviorSubject<T> = Omit<BehaviorSubject<T>, 'complete' | 'error' | 'next'>;
