import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { AccordionRegistry } from './accordion.registry';

import type { Subscription } from 'rxjs';
@Component({
  selector: 'tab-accordion',
  standalone: false,
  template: '<ng-content select="tab-expansion-panel" />',
  styles: `
    :host {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      ::ng-deep tab-expansion-panel:not(:first-child) {
        margin-top: -1px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': '"tablist"',
    '[attr.aria-multiselectable]': 'false',
    '[attr.aria-orientation]': '"vertical"',
  },
})
export class AccordionComponent {
  readonly registry = new AccordionRegistry();

  private subs: Subscription[] = [];
  private readonly registryChanged = effect(() => {
    const items = this.registry.nodes();
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
    this.subs = items.map(item =>
      item.expandedChange$.subscribe(expanded => {
        if (expanded) {
          items.forEach(i => {
            if (i.id !== item.id) {
              i.$expanded.set(false);
            }
          });
        }
      }),
    );
  });
}
