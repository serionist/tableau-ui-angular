import type { AC } from '../interfaces';
import type { Meta } from '../meta/interfaces';

export interface RegisterFns<TChild = AC> {
  enableChange: (callback: (enabled: boolean) => void) => TChild;

  metaChange: (callback: (meta: Meta) => void) => TChild;
  alwaysDisabled: () => TChild;
}
