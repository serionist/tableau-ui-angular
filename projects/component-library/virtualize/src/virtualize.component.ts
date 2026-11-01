import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, contentChild, ElementRef, HostListener, inject, input, model } from '@angular/core';
import type { DataRowCss } from './base/virutalize-base.component';
import { VirtualizeBaseComponent } from './base/virutalize-base.component';
import type { DataOptions } from './data/data-options';
import type { DataSort } from './data/data-sort';
import { ItemTemplateDirective } from './templates/item-template.directive';
import { LoadingTemplateDirective } from './templates/loading-template.directive';
import { ErrorTemplateDirective } from './templates/error-template.directive';
import { CustomLoaderDirective } from './templates/custom-loader.directive';
@Component({
  selector: 'tab-virtualize',
  standalone: false,
  templateUrl: './virtualize.component.html',
  styleUrl: './virtualize.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualizeComponent<TData> extends VirtualizeBaseComponent<TData> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    super(inject(ChangeDetectorRef));
  }

  // #region Inputs
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

  // the dataWindowHeightPx input, or the host's height
  protected measureDataWindowHeightPx(): number {
    return this.$dataWindowHeightPx() ?? this.host.nativeElement.clientHeight;
  }

  @HostListener('scroll', ['$any($event.target)'])
  protected onHostScrolled(element: HTMLElement) {
    super.onScroll(element);
  }
}
