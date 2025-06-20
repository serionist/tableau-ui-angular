import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, contentChild, effect, ElementRef, HostListener, inject, input, model, untracked, viewChild } from '@angular/core';
import type { DataRowCss } from './base/virutalize-base.component';
import { VirtualizeBaseComponent } from './base/virutalize-base.component';
import type { DataOptions } from './data/data-options';
import type { DataSort } from './data/data-sort';
import { ItemTemplateDirective } from './templates/item-template.directive';
import { LoadingTemplateDirective } from './templates/loading-template.directive';
import { ErrorTemplateDirective } from './templates/error-template.directive';

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
   * The height of the data row.
   * This must be a valid CSS value.
   * Fixed height is required for virtual scrolling to work properly.
   * If the height is not fixed, the container will not be able to calculate the row heights and will not be able to scroll properly.
   * @default '2.5em'
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
   * The sort models.
   * @default []
   */
  readonly $dataSort = model.required<DataSort[]>({
    alias: 'dataSort',
  });

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
  // #endregion Templates
  
  protected readonly $dataRowHorizontalPaddingPx = computed(() => {
    const computedStyle = this.$dataRowComputedStyle();
    const getPxValue = (prop: string, value: string) => {
      if (value.endsWith('px')) {
        return parseFloat(value);
      }
      throw new Error(`Invalid CSS value for ${prop}: ${value}. It must be a pixel value.`);
    };
    return (
      getPxValue('paddingLeft', computedStyle.paddingLeft) +
      getPxValue('paddingRight', computedStyle.paddingRight) +
      getPxValue('marginLeft', computedStyle.marginLeft) +
      getPxValue('marginRight', computedStyle.marginRight) +
      getPxValue('borderLeftWidth', computedStyle.borderLeftWidth) +
      getPxValue('borderRightWidth', computedStyle.borderRightWidth)
    );
  });
  
  private loaded = false;
  private dataWindowHeightPx: number = 0;
  /**
   * Loads the container data. Only callable once. If the container is already loaded, this will do nothing.
   * This will calculate the available window height and reset() the container.
   * Use this to load the container initially
   * Use reload() to reload the container data if the container size changes
   */
  async load() {
    if (this.loaded) {
      return false;
    }
    return this.reload();
  }

  /**
   * Reloads the container data.
   * This will re-calculate the available window height and reset() the container.
   * Use this to reload the container data if the container size changes
   */
  async reload() {
    this.loaded = false;
    console.log(this.host.nativeElement);
    const host = this.host.nativeElement;
    this.dataWindowHeightPx = host.clientHeight;
    const initialLoad = await this.resetInternal(this.$dataSort(), this.$dataOptions(), this.$dataBlockWindow());
    if (initialLoad) {
      this.loaded = true;
    }
    return initialLoad;
  }

  /**
   * Resets the container to its initial state.
   * This will reset the scroll position, and data
   * If resetSort is true, the sort will also be reset to the initial state.
   * @param resetSort Whether to reset the sort to the initial state
   * @returns A promise that resolves to true if the reset was successful, false otherwise.
   */
  async reset(resetSort: boolean = false): Promise<boolean> {
    if (!this.loaded) {
      return false;
    }
    if (resetSort) {
      this.$dataSort.set([]);
    }
    const sort = this.$dataSort();
    const dataOptions = this.$dataOptions();
    const dataBlockWindow = this.$dataBlockWindow();
    return this.resetInternal(sort, dataOptions, dataBlockWindow);
  }

  private readonly autoReset = effect(() => {
    const sort = this.$dataSort();
    const dataOptions = this.$dataOptions();
    const dataBlockWindow = this.$dataBlockWindow();
    this.$dataRowComputedStyle(); // ensure the data row style is computed and run this on change
    if (!this.loaded) {
      return;
    }

    untracked(() => void this.resetInternal(sort, dataOptions, dataBlockWindow));
  });

  private async resetInternal(sort: DataSort[] | undefined, dataOptions: DataOptions<TData> | undefined, dataBlockWindow: number): Promise<boolean> {
    if (this.dataWindowHeightPx === 0 || !sort || !dataOptions) {
      console.warn('Container reset called with undefined parameters, ignoring');
      return false;
    }
    
    const dataRowHeightPx = this.$dataRowHeightPx();
    console.log('asd', this.dataWindowHeightPx, dataRowHeightPx, this.$dataRowCss().height);
    await this.dataManager.reset(this.dataWindowHeightPx, dataRowHeightPx, sort, dataBlockWindow, dataOptions);
    return true;
  }

  @HostListener('scroll', ['$event.target'])
  private onHostScrolled(element: HTMLElement) {
    super.onScroll(element)
  }
}
