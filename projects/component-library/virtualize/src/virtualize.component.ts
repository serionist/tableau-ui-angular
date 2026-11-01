import type { InputSignal, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, contentChild, ElementRef, HostAttributeToken, HostListener, inject, input, model } from '@angular/core';
import type { DataRowCss } from './base/virutalize-base.component';
import { VirtualizeBaseComponent } from './base/virutalize-base.component';
import type { DataOptions } from './data/data-options';
import type { DataSort } from './data/data-sort';
import { ItemTemplateDirective } from './templates/item-template.directive';
import { LoadingTemplateDirective } from './templates/loading-template.directive';
import { ErrorTemplateDirective } from './templates/error-template.directive';
import { CustomLoaderDirective } from './templates/custom-loader.directive';
/**
 * A list that draws only the items near its view, and scrolls them in its own host.
 *
 * The host takes focus, so the keyboard scrolls it in every browser; a static `tabindex="-1"` the app writes on
 * `tab-virtualize` takes it out of the Tab order. While it shows items it is a `list`, and each item a `listitem` with
 * its place in the whole list: `aria-posinset`, and `aria-setsize`, `-1` until the total is known. While it shows no
 * items, its no-data template or its custom loader, it is a `region`, and without a name it has no role. `label` names
 * it, or else a static `aria-label` the app writes on `tab-virtualize`.
 *
 * An app whose items have a role of their own writes a static `role` attribute on `tab-virtualize`, such as
 * `role="listbox"`: the host keeps that role, and its items take no role. The role is read once, when the host is
 * created, so a bound `[attr.role]` isn't read.
 */
@Component({
  selector: 'tab-virtualize',
  standalone: false,
  templateUrl: './virtualize.component.html',
  styleUrl: './virtualize.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    '[attr.role]': '$role()',
    '[attr.aria-label]': '$ariaLabel()',
  },
})
export class VirtualizeComponent<TData> extends VirtualizeBaseComponent<TData> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // The app's own static role and name on the host. The bindings keep them, since a binding that returned null would
  // remove them at the first change detection
  private readonly appRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly appAriaLabel = inject(new HostAttributeToken('aria-label'), { optional: true });
  // the list and its items take the library's roles unless the app gave the host a role of its own
  protected readonly listRoles = this.appRole === null;

  constructor() {
    super(inject(ChangeDetectorRef));
  }

  // #region Inputs
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  /**
   * Names the list for screen readers, and the region it is while it shows no items: "Customers". A virtual scroller
   * that scrolls needs it, or a static `aria-label` on `tab-virtualize`: its host takes focus, so a screen reader names
   * what the keyboard reached.
   * @default undefined
   */
  readonly $label: InputSignal<string | undefined> = input<string>(undefined, {
    alias: 'label',
  });

  /**
   * The data options for the table
   */
  override readonly $dataOptions = input.required<DataOptions<TData>>({
    alias: 'dataOptions',
  });

  /**
   * The CSS of a data row: its height, line height and padding, and any other CSS.
   * The height must be a fixed CSS length for virtual scrolling to work properly.
   * It is the height of the row's content: a row is drawn that tall plus its vertical padding and borders.
   * @default { height: '1.5em', padding: '0em 0.5em', lineHeight: 'inherit' }
   */
  override readonly $dataRowCss = input<DataRowCss>(
    {
      height: '1.5em',
      padding: '0em 0.5em',
      lineHeight: 'inherit',
    },
    {
      alias: 'dataRowCss',
    },
  );

  /**
   * The height of the data window in pixels.
   * When undefined, the height will be calculated based on the container size.
   * If set, this will override the automatic height calculation.
   * It is read by load() and reload(): call reload() after changing it.
   */
  readonly $dataWindowHeightPx = input<number | undefined>(undefined, {
    alias: 'dataWindowHeightPx',
  });
  /**
   * The sort models.
   * @default []
   */
  readonly $dataSort = model.required<DataSort[]>({
    alias: 'dataSort',
  });
  protected readonly $sortModel = this.$dataSort;

  /**
   * The number of data blocks to load before and after the currently displayed block(s) based on scroll position.
   * This is used to determine how many blocks to load in advance for smooth scrolling.
   * A data block is a chunk of data that is loaded from the server. It's size is is whatever fits the current viewport.
   * @default 3
   */
  readonly $dataBlockWindow = input<number>(3, {
    alias: 'dataBlockWindow',
  });

  /**
   * The template to use when there is no data to display.
   * If 'default', a default template will be used.
   * If a TemplateRef is provided, it will be used as the no data template.
   * @default 'default'
   */
  readonly $noDataTemplate = input<TemplateRef<unknown> | string | 'default'>('default', {
    alias: 'noDataTemplate',
  });

  // #endregion Inputs
  // #region Templates
  readonly $itemTemplate = contentChild.required<ItemTemplateDirective<TData>>(ItemTemplateDirective);
  readonly $loadingTemplate = contentChild<LoadingTemplateDirective>(LoadingTemplateDirective);
  readonly $errorTemplate = contentChild(ErrorTemplateDirective);
  readonly $customLoaderTemplate = contentChild(CustomLoaderDirective);
  // #endregion Templates

  // #region Accessibility
  // What the host shows: the no-data template while it has no blocks, the custom loader while a reset waits for its
  // first block, else the items
  protected readonly $shows = computed<'items' | 'loader' | 'no-data'>(() => {
    if (this.dataManager.$blocks().blocks.length === 0) {
      return 'no-data';
    }
    return this.$loading() && this.$customLoaderTemplate() !== undefined ? 'loader' : 'items';
  });
  // the label, else the app's own static aria-label, whichever has words
  private readonly $name = computed(() => words(this.$label()) ?? words(this.appAriaLabel));
  // A list while it shows items; with no items a region, which a name must name, so none without one
  protected readonly $role = computed(() => {
    if (this.appRole !== null) {
      return this.appRole;
    }
    if (this.$shows() === 'items') {
      return 'list';
    }
    return this.$name() === undefined ? null : 'region';
  });
  protected readonly $ariaLabel = computed(() => this.$name() ?? null);
  // #endregion Accessibility

  // A row is drawn border-box at the height the virtual scroll counts, less its margins, its padding and borders inside
  // it, so its content keeps the app's own box-sizing; the binding sets its height, not the row's CSS
  protected readonly $itemCss = computed(() => {
    const css: Partial<DataRowCss> = { ...this.$dataRowCss() };
    delete css.height;
    return css;
  });
  protected readonly $itemHeightPx = computed(() => {
    const style = this.$dataRowComputedStyle();
    return this.$dataRowHeightPx() - parseFloat(style.marginTop) - parseFloat(style.marginBottom);
  });

  // the dataWindowHeightPx input, or the host's height
  protected measureDataWindowHeightPx(): number {
    return this.$dataWindowHeightPx() ?? this.host.nativeElement.clientHeight;
  }

  @HostListener('scroll', ['$any($event.target)'])
  protected onHostScrolled(element: HTMLElement) {
    super.onScroll(element);
  }
}

// A name, unless it has no words
function words(name: string | null | undefined): string | undefined {
  return name !== null && name !== undefined && name.trim() !== '' ? name : undefined;
}
