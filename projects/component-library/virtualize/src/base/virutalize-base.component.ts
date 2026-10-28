import type { ChangeDetectorRef, Signal } from '@angular/core';
import { computed } from '@angular/core';
import type { DataOptions } from '../data/data-options';
import { DataManager } from '../data/data-manager';

type Unit = 'px' | 'em' | 'rem' | '%' | '';
type NumericUnit = `${number}${Unit}`;
type PaddingValue = NumericUnit | `${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit} ${NumericUnit}`;
export type DataRowCss = Partial<Record<keyof CSSStyleDeclaration, string>> & {
  height: NumericUnit;
  lineHeight: string;
  padding: PaddingValue;
};
export abstract class VirtualizeBaseComponent<TData> {
  // #region Signals
  /**
   * The data load options.
   */
  abstract $dataOptions: Signal<DataOptions<TData>>;

  /**
   * The CSS of the data row.
   * 'height' is required and should be a valid CSS height value (e.g., '50px', '3em'). Height needs to be fixed for virtualization to work correctly.
   * 'lineHeight' is required and should be a valid CSS line-height value (e.g., '1.5', initial).
   * 'padding' is required and should be a valid CSS padding value (e.g., '10px', '1em 2em').
   * Other CSS properties can be added as needed, but they are not required.
   */
  abstract $dataRowCss: Signal<DataRowCss>;

  // #endregion Signals

  protected readonly $dataRowComputedStyle: Signal<CSSStyleDeclaration> = computed(() => {
    const css = this.$dataRowCss();
    const el = document.createElement('div');
    for (const [key, value] of Object.entries(css)) {
      if (value !== undefined && key in el.style) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        el.style[key as any] = value;
      }
    }
    el.style.position = 'fixed'; // Ensure the element is not affected by the document's layout
    el.style.top = '-1000px'; // Move it out of view
    el.style.left = '-1000px'; // Move it out of view
    document.body.appendChild(el);
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const style = { ...getComputedStyle(el) };
    document.body.removeChild(el);
    return style;
  });
  protected readonly $dataRowHeightPx = computed(() => {
    const computedStyle = this.$dataRowComputedStyle();
    const getPxValue = (prop: string, value: string) => {
      if (value.endsWith('px')) {
        return parseFloat(value);
      }
      throw new Error(`Invalid CSS value for ${prop}: ${value}. It must be a pixel value.`);
    };
    return (
      getPxValue('height', computedStyle.height) +
      getPxValue('paddingTop', computedStyle.paddingTop) +
      getPxValue('paddingBottom', computedStyle.paddingBottom) +
      getPxValue('marginTop', computedStyle.marginTop) +
      getPxValue('marginBottom', computedStyle.marginBottom) +
      getPxValue('borderTopWidth', computedStyle.borderTopWidth) +
      getPxValue('borderBottomWidth', computedStyle.borderBottomWidth)
    );
  });
 

  protected readonly dataManager: DataManager<TData>;

  protected onScroll(virtualizeContainer: HTMLElement) {
    this.dataManager.setScrollPosition(virtualizeContainer.scrollTop);
  }

  constructor(cdr: ChangeDetectorRef) {
    this.dataManager = new DataManager<TData>(cdr);
  }
}
