import type { InputSignal, OnDestroy, OnInit, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, model } from '@angular/core';
import { ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective } from './expansion-panel-title.component';
import { AccordionComponent } from './accordion.component';
import type { AccordionRegistry } from './accordion.registry';
import { toObservable } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { generateRandomString } from 'tableau-ui-angular/utils';

@Component({
  selector: 'tab-expansion-panel',
  standalone: false,
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.expanded]': '$expanded() ? true : null',
    '[attr.disabled]': '$disabled() ? true : null',
  },
})
export class ExpansionPanelComponent implements OnInit, OnDestroy {
  readonly id = generateRandomString(16);
  // the element that holds the title shown, which names the toggle
  protected readonly titleId = `tab-expansion-panel-title-${this.id}`;
  /**
   * The expanded state of the panel.
   * @default false
   */
  readonly $expanded = model<boolean>(false, {
    alias: 'expanded',
  });
  readonly expandedChange$ = toObservable(this.$expanded).pipe(startWith(this.$expanded()));
  /**
   * The disabled state of the panel.
   * @default false
   */
  readonly $disabled = input<boolean>(false, {
    alias: 'disabled',
  });
  /**
   * Disables the hover color of the header
   */
  readonly $noHeaderHover = input<boolean>(false, {
    alias: 'noHeaderHover',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * Names the panel's toggle button for screen readers, in place of its title: "Order 1024". Give it when the title
   * holds a control, such as a button, or more than the panel's name. Without it the toggle takes the title's whole
   * text, a control's included, and without a title either it is named Details.
   * @default undefined
   */
  readonly $label: InputSignal<string | undefined> = input<string>(undefined, {
    alias: 'label',
  });
  // the toggle takes the label when it has words, else the title shown
  protected readonly $hasLabel = computed(() => (this.$label() ?? '').trim() !== '');

  protected readonly $expandedHeader: Signal<ExpansionPanelTitleExpandedContentDirective | undefined> = contentChild(ExpansionPanelTitleExpandedContentDirective);
  protected readonly $collapsedHeader: Signal<ExpansionPanelTitleCollapsedContentDirective | undefined> = contentChild(ExpansionPanelTitleCollapsedContentDirective);
  protected readonly $title: Signal<ExpansionPanelTitleComponent | undefined> = contentChild(ExpansionPanelTitleComponent);

  private readonly accordion = inject(AccordionComponent, {
    skipSelf: true,
    optional: true,
  });

  public readonly $registry = input<AccordionRegistry>(undefined, {
    alias: 'registry',
  });

  ngOnInit(): void {
    const registry = this.$registry() ?? this.accordion?.registry;
    registry?.register(this);
  }
  ngOnDestroy(): void {
    const registry = this.$registry() ?? this.accordion?.registry;
    registry?.unregister(this);
  }

  protected setExpanded(expanded: boolean) {
    if (this.$disabled()) {
      return;
    }
    this.$expanded.set(expanded);
  }
  protected onclick() {
    if (this.$disabled()) {
      return;
    }
    this.setExpanded(!this.$expanded());
  }
}
