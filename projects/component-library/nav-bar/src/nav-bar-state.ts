import type { Signal } from '@angular/core';

// The nav bar's state, which the bar provides to what it holds. A file of its own, so the header can inject it
// without importing the bar, which imports the header: the bundle would read one of them before it is defined.
export abstract class NavBarState {
  abstract readonly $expanded: Signal<boolean>;
}
