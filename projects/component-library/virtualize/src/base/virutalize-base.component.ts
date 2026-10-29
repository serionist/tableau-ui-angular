import type { ChangeDetectorRef, Signal, WritableSignal } from '@angular/core';
import { computed, DestroyRef, DOCUMENT, effect, ElementRef, inject, PLATFORM_ID, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { DataOptions } from '../data/data-options';
import type { DataSort } from '../data/data-sort';
import { DataManager } from '../data/data-manager';

type Unit = 'px' | 'em' | 'rem' | '%' | '';
type NumericUnit = `${number}${Unit}`;
type PaddingValue = NumericUnit | `${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit}` | `${NumericUnit} ${NumericUnit} ${NumericUnit} ${NumericUnit}`;
export type DataRowCss = Partial<Record<keyof CSSStyleDeclaration, string>> & {
  height: NumericUnit;
  lineHeight: string;
  padding: PaddingValue;
};

// The properties of a data row's computed style that are read, each by name: spreading getComputedStyle() copies none
// of them in Firefox
const ROW_STYLE_PROPERTIES = [
  'height',
  'lineHeight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
] as const;
type DataRowStyle = Pick<CSSStyleDeclaration, (typeof ROW_STYLE_PROPERTIES)[number]>;

// What a reset loads with; a change to any of them, once loaded, resets again
interface ResetInputs<TData> {
  sort: DataSort[];
  dataOptions: DataOptions<TData>;
  dataBlockWindow: number;
  dataRowCss: DataRowCss;
}

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

  /**
   * The number of data blocks to load before and after the shown ones.
   */
  abstract $dataBlockWindow: Signal<number>;

  /**
   * The sort the data loads with, which `reset(true)` clears.
   */
  protected abstract readonly $sortModel: WritableSignal<DataSort[]>;

  // #endregion Signals

  /**
   * The height in pixels the rows are shown in. `reload()` measures it, in the browser only.
   */
  protected abstract measureDataWindowHeightPx(): number;

  /**
   * Runs before each reset of the data: `'manual'` for `reset()`, `'auto'` when an input the data loads with changes.
   * `reload()` runs none.
   */
  protected beforeReset?(trigger: 'auto' | 'manual'): void;

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // reload() counts up, so the row is measured again: a font the app changed since shows in its em sizes
  private readonly $measures = signal(0);

  /**
   * A data row's computed style, measured inside the host, so its em sizes and inherited line height are the host's,
   * when `dataRowCss` changes and on each `reload()`.
   * On the server, which lays nothing out, each value is `0px`.
   */
  protected readonly $dataRowComputedStyle: Signal<DataRowStyle> = computed(() => {
    const css = this.$dataRowCss();
    this.$measures();
    if (!this.isBrowser) {
      return Object.fromEntries(ROW_STYLE_PROPERTIES.map(property => [property, '0px'])) as DataRowStyle;
    }
    const el = this.document.createElement('div');
    for (const [key, value] of Object.entries(css)) {
      if (value !== undefined && key in el.style) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        el.style[key as any] = value;
      }
    }
    el.style.position = 'fixed'; // Ensure the element is not affected by the document's layout
    el.style.top = '-1000px'; // Move it out of view
    el.style.left = '-1000px'; // Move it out of view
    this.hostRef.nativeElement.appendChild(el);
    const style = this.document.defaultView!.getComputedStyle(el);
    const measured = Object.fromEntries(ROW_STYLE_PROPERTIES.map(property => [property, style[property]])) as DataRowStyle;
    el.remove();
    return measured;
  });
  protected readonly $dataRowHeightPx = computed(() => {
    const computedStyle = this.$dataRowComputedStyle();
    return (
      pixels('height', computedStyle.height) +
      pixels('paddingTop', computedStyle.paddingTop) +
      pixels('paddingBottom', computedStyle.paddingBottom) +
      pixels('marginTop', computedStyle.marginTop) +
      pixels('marginBottom', computedStyle.marginBottom) +
      pixels('borderTopWidth', computedStyle.borderTopWidth) +
      pixels('borderBottomWidth', computedStyle.borderBottomWidth)
    );
  });

  protected readonly dataManager: DataManager<TData>;

  /**
   * Whether a reset is loading the first block of the data.
   */
  protected readonly $loading = signal(false);

  protected onScroll(virtualizeContainer: HTMLElement) {
    this.dataManager.setScrollPosition(virtualizeContainer.scrollTop);
  }

  constructor(cdr: ChangeDetectorRef) {
    this.dataManager = new DataManager<TData>(cdr);
    // a destroyed component's loads are cancelled, and what they answer is dropped
    inject(DestroyRef).onDestroy(() => {
      this.dataManager.destroy();
    });
  }

  // #region Load & Reset
  private loaded = false;
  private dataWindowHeightPx = 0;
  private lastReset: ResetInputs<TData> | undefined = undefined;
  private resets = 0;

  // load(), reload() and reset() run untracked: an app may call them from an effect of its own, which must not take
  // the signals a reset reads, and then writes, as its inputs, or it would run again on each and reset again

  /**
   * Loads the data. Only callable once: when the data is already loaded, this does nothing and returns false.
   * This measures the window the rows are shown in, and reset()s.
   * Use this to load the data initially, and reload() when the size changes.
   * On the server, which lays nothing out, nothing loads and this returns false.
   */
  async load(): Promise<boolean> {
    return untracked(async () => (this.loaded ? false : this.reloadNow()));
  }

  /**
   * Reloads the data.
   * This measures the window the rows are shown in, and a row, again, and reset()s.
   * Use this to reload the data when the size or the font changes.
   * On the server, which lays nothing out, nothing loads and this returns false.
   */
  async reload(): Promise<boolean> {
    return untracked(async () => this.reloadNow());
  }

  /**
   * Resets the data to its initial state: the scroll position and the data, and in a table the selection, as its
   * selection options say.
   * If resetSort is true, the sort is also cleared.
   * @param resetSort Whether to clear the sort
   * @returns A promise that resolves to true if the reset was successful, false otherwise.
   */
  async reset(resetSort: boolean = false): Promise<boolean> {
    return untracked(async () => this.resetNow(resetSort));
  }

  private async reloadNow(): Promise<boolean> {
    this.loaded = false;
    if (!this.isBrowser) {
      return false;
    }
    this.$measures.update(measures => measures + 1);
    this.dataWindowHeightPx = this.measureDataWindowHeightPx();
    const inputs = this.resetInputs();
    if (!this.canReset(inputs)) {
      return false;
    }
    // loaded before the first block comes, so a change to the inputs while it loads resets again
    this.loaded = true;
    return this.resetWith(inputs);
  }

  private async resetNow(resetSort: boolean): Promise<boolean> {
    if (!this.loaded) {
      return false;
    }
    if (resetSort) {
      this.$sortModel.set([]);
    }
    this.beforeReset?.('manual');
    return this.resetWith(this.resetInputs());
  }

  // Once loaded, a change to the sort, the data options, the block window or the row's CSS resets; a reset that
  // already loads with them, such as reset(true)'s cleared sort, isn't repeated
  private readonly autoReset = effect(() => {
    const inputs = this.resetInputs();
    if (!this.loaded || (this.lastReset !== undefined && sameInputs(inputs, this.lastReset))) {
      return;
    }
    untracked(() => {
      this.beforeReset?.('auto');
      void this.resetWith(inputs);
    });
  });

  private resetInputs(): ResetInputs<TData> {
    return {
      sort: this.$sortModel(),
      dataOptions: this.$dataOptions(),
      dataBlockWindow: this.$dataBlockWindow(),
      dataRowCss: this.$dataRowCss(),
    };
  }

  private canReset(inputs: ResetInputs<TData>): boolean {
    // an app without strict templates can bind undefined
    const { sort, dataOptions } = inputs as Partial<ResetInputs<TData>>;
    if (this.dataWindowHeightPx <= 0) {
      console.warn('Reset ignored: the window the rows are shown in measured 0 px, as in a hidden host. Call reload() once it is shown.');
      return false;
    }
    if (!sort || !dataOptions) {
      console.warn('Reset ignored: no sort or no data options');
      return false;
    }
    return true;
  }

  private async resetWith(inputs: ResetInputs<TData>): Promise<boolean> {
    if (!this.canReset(inputs)) {
      return false;
    }
    this.lastReset = inputs;
    // only the newest reset ends the loading state
    const reset = ++this.resets;
    this.$loading.set(true);
    try {
      await this.dataManager.reset(this.dataWindowHeightPx, this.$dataRowHeightPx(), inputs.sort, inputs.dataBlockWindow, inputs.dataOptions);
    } finally {
      if (reset === this.resets) {
        this.$loading.set(false);
      }
    }
    return true;
  }
  // #endregion
}

function sameInputs<TData>(a: ResetInputs<TData>, b: ResetInputs<TData>): boolean {
  return a.sort === b.sort && a.dataOptions === b.dataOptions && a.dataBlockWindow === b.dataBlockWindow && a.dataRowCss === b.dataRowCss;
}

function pixels(property: string, value: string): number {
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  throw new Error(`Invalid CSS value for ${property}: ${value}. It must be a pixel value.`);
}
