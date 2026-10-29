import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChild, effect, ErrorHandler, forwardRef, inject, input, model, output, signal, untracked, viewChild } from '@angular/core';
import { ChipTemplateDirective } from '../directives/chip-template.directive';
import type { ChipData } from '../models/chip-data';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'tab-chip-control',
  standalone: false,
  templateUrl: './chip-control.component.html',
  styleUrl: './chip-control.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipControlComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tab-input',
    tabindex: '-1',
    '(click)': '$inputControl().nativeElement.focus()',
    '[class.focused]': '$focused()',
    '[attr.disabled]': '$disabled() ? "true": undefined',
  },
})
export class ChipControlComponent<TKey, TValue> implements ControlValueAccessor {
  readonly self = this;
  private readonly errorHandler = inject(ErrorHandler);
  // The values array before the app binds one: no app write, so it never replaces the keys a form wrote
  private readonly noValues: ChipData<TKey, TValue>[] = [];
  // #region Inputs and Outputs
  /**
   * The keys of the chip control.
   * Keys are basic structs that are used to identify chips.
   * They are not displayed in the UI.
   */
  readonly $keys = model<TKey[]>([], {
    alias: 'keys',
  });

  /**
   * The values of the chip control.
   * Values are the actual data that is displayed in the UI.
   * They can be of any type, including complex objects.
   * This allows for flexibility in the data structure used in the chip control.
   */
  readonly $values = model<ChipData<TKey, TValue>[]>(this.noValues, {
    alias: 'values',
  });

  /**
   * A function to compare two keys.
   * This is used to determine if two keys are equal.
   */
  readonly $keyComparer = input<(a: TKey, b: TKey) => boolean>((a, b) => a === b, {
    alias: 'keyComparer',
  });
  /**
   * A function to get the item values based on keys.
   * This is called when the keys are manually changed.
   */
  readonly $getValuesByKeys = input.required<(keys: TKey[]) => Promise<ChipData<TKey, TValue>[]>>({
    alias: 'getValuesByKeys',
  });

  /**
   * Disables the chip control.
   */
  readonly $disabled = model<boolean>(false, {
    alias: 'disabled',
  });

  /**
   * Used to call an event when the search input is focused/onfocused
   */
  readonly $searchFocused = output<boolean>();

  /**
   * Used to call an event when a key is pressed in the search input.
   * This is useful for handling keyboard interactions, such as filtering or searching.
   * Backspace, Left/Right Arrow and Delete keys are not emitted.
   */
  readonly $searchKeydown = output<KeyboardEvent>();

  /**
   * Called when the search input is clicked.
   * This is useful for handling click events on the search input, such as focusing the input or performing actions based on the click.
   */
  readonly $searchClicked = output<MouseEvent>();

  /**
   * Called when a chip is added to the chip control.
   */
  readonly $chipAdded = output<ChipData<TKey, TValue>>();

  /**
   * Called when a chip is removed from the chip control.
   * This is useful for handling chip removal events, such as updating the UI or performing actions based on the removal.
   */
  readonly $chipRemoved = output<TKey>();

  // #endregion Inputs and Outputs
  // #region Public Methods
  /**
   * Clears the input field.
   */
  public clearInput() {
    this.$inputControl().nativeElement.value = '';
  }
  /**
   * Adds a chip to the chip control.
   * @param key
   * @param value
   * @param clearInput
   */
  public add(key: TKey, value: TValue, clearInput: boolean): void {
    this.remember([{ key, value }]);
    const keys = this.$currentKeys();
    if (!keys.some(k => this.$keyComparer()(k, key))) {
      this.changeKeys([...keys, key]);
    }
    if (clearInput) {
      this.clearInput();
    }
  }
  /**
   * Manually removes a chip from the chip control.
   * This is useful for removing chips that are no longer needed or relevant.
   * Users can also remove chips by clicking on them in the UI.
   * @param key
   */
  public remove(key: TKey) {
    const keys = this.$currentKeys();
    if (keys.some(k => this.$keyComparer()(k, key))) {
      this.changeKeys(keys.filter(k => !this.$keyComparer()(k, key)));
    }
  }

  public focus() {
    if (this.$disabled()) {
      return;
    }
    this.$inputControl().nativeElement.focus();
  }

  // #endregion Public Methods

  protected readonly $inputControl = viewChild.required<ElementRef<HTMLInputElement>>('inputControl');
  readonly $chipTemplate = contentChild.required<ChipTemplateDirective<TKey, TValue>>(ChipTemplateDirective);

  // #region keys/values change events
  // The keys are the one state that changes: a form's write, the keys or values the app binds, add() and remove() all
  // set them, and the chips shown follow from them and from what is known about each key.

  // A null write (a new FormControl, reset()) is no chips
  private readonly $currentKeys = computed(() => this.$keys() ?? []);
  // What each key shows, from add(), the values the app binds and the lookup; only the current keys' data is kept, so
  // a key added again is looked up again
  private readonly $known = signal<ChipData<TKey, TValue>[]>([]);
  /** The chips shown: the keys whose data is known, in the keys' order. */
  protected readonly $chips = computed(() => {
    const comparer = this.$keyComparer();
    const known = this.$known();
    const chips: ChipData<TKey, TValue>[] = [];
    for (const key of this.$currentKeys()) {
      const chip = known.find(k => comparer(k.key, key));
      if (chip) {
        chips.push(chip);
      }
    }
    return chips;
  });
  protected readonly $chipViews = computed(() => {
    const comparer = this.$keyComparer();
    const highlighted = this.$highlightedChip();
    return this.$chips().map(chip => ({ chip, selected: highlighted !== undefined && comparer(highlighted, chip.key) }));
  });

  // The keys asked of the lookup and not answered yet, and how many lookups are waiting or running
  private requested: TKey[] = [];
  private readonly $lookups = signal(0);
  /**
   * A signal that indicates whether the values are currently being loaded.
   * This is called when the keys are manually changed.
   * Shows a loading indicator on the UI.
   */
  protected readonly $isLoadingValues = computed(() => this.$lookups() > 0);
  private loadChain = Promise.resolve();
  private readonly keysChanged = effect(() => {
    const keys = this.$currentKeys();
    const comparer = this.$keyComparer();
    untracked(() => {
      // values the app set and valuesChanged has not taken in yet bring their keys' data, and may set other keys
      if (this.$values() !== this.writtenValues) {
        return;
      }
      const has = (list: readonly TKey[], key: TKey) => list.some(k => comparer(k, key));
      const known = this.$known();
      if (known.some(k => !has(keys, k.key))) {
        this.$known.set(known.filter(k => has(keys, k.key)));
      }
      const highlighted = this.$highlightedChip();
      if (highlighted !== undefined && !has(keys, highlighted)) {
        this.$highlightedChip.set(undefined);
      }
      const missing = keys.filter(key => !known.some(k => comparer(k.key, key)) && !has(this.requested, key));
      if (missing.length > 0) {
        this.requested = [...this.requested, ...missing];
        this.$lookups.update(n => n + 1);
        this.loadChain = this.loadChain.then(async () => this.load(missing));
      }
    });
  });

  // Looks up the keys still shown; the answer joins what is known, so the chips follow the keys as they are by then
  private async load(keys: TKey[]) {
    const comparer = this.$keyComparer();
    const current = (key: TKey) => this.$currentKeys().some(k => comparer(k, key));
    try {
      const wanted = keys.filter(current);
      if (wanted.length > 0) {
        const results = await this.$getValuesByKeys()(wanted);
        this.remember(results.filter(result => result.value !== undefined && current(result.key)));
      }
    } catch (error) {
      // a failed lookup leaves its keys without chips, and the next one still runs
      this.errorHandler.handleError(error);
    } finally {
      this.requested = this.requested.filter(r => !keys.some(k => comparer(k, r)));
      this.$lookups.update(n => n - 1);
    }
  }

  private remember(data: readonly ChipData<TKey, TValue>[]) {
    if (data.length === 0) {
      return;
    }
    const comparer = this.$keyComparer();
    this.$known.update(known => [...known.filter(k => !data.some(d => comparer(d.key, k.key))), ...data]);
  }

  // The values array this control last wrote, so its own write is told from the app's
  private writtenValues: ChipData<TKey, TValue>[] = this.noValues;
  private shownChips: ChipData<TKey, TValue>[] = [];
  private readonly chipsChanged = effect(() => {
    const chips = this.$chips();
    untracked(() => {
      const comparer = this.$keyComparer();
      const before = this.shownChips;
      this.shownChips = chips;
      const values = this.$values() ?? [];
      // values the app set and valuesChanged has not taken in yet are left to it, which sets the keys from them
      const appWrite = this.$values() !== this.writtenValues;
      if (!appWrite && (values.length !== chips.length || values.some((value, i) => value !== chips[i]))) {
        // a copy, so an app that changes the array it gets changes nothing here
        this.writtenValues = [...chips];
        this.$values.set(this.writtenValues);
      }
      for (const chip of before.filter(b => !chips.some(c => comparer(c.key, b.key)))) {
        this.$chipRemoved.emit(chip.key);
      }
      for (const chip of chips.filter(c => !before.some(b => comparer(b.key, c.key)))) {
        this.$chipAdded.emit(chip);
      }
    });
  });

  // Values the app binds are chips to show: what they show is remembered, and their keys become the keys
  private readonly valuesChanged = effect(() => {
    const values = this.$values() ?? [];
    untracked(() => {
      if (values === this.writtenValues) {
        return;
      }
      this.writtenValues = values;
      this.remember(values);
      const comparer = this.$keyComparer();
      const keys = values.map(v => v.key);
      const current = this.$currentKeys();
      // a key still being looked up has no chip in the values yet: it stays, after the key it followed
      let at = 0;
      for (const key of current) {
        const index = keys.findIndex(k => comparer(k, key));
        if (index !== -1) {
          at = index + 1;
        } else if (this.requested.some(r => comparer(r, key))) {
          keys.splice(at, 0, key);
          at++;
        }
      }
      if (keys.length !== current.length || keys.some((key, i) => !comparer(key, current[i]))) {
        this.$keys.set(keys);
      }
    });
  });

  // A change the user makes, through the keyboard, a chip's remove button, add() or remove(): the form hears of it
  private changeKeys(keys: TKey[]) {
    this.$keys.set(keys);
    this._onChange([...keys]);
  }

  // #endregion keys/values change events

  // #region Focus & Selection
  protected readonly $focused = signal<boolean>(false);
  private readonly focusEffect = effect(() => {
    this.$searchFocused.emit(this.$focused());
  });
  // Touched when the user leaves the control, as Angular's own inputs are, which commits an updateOn: 'blur' change
  protected onBlur() {
    this.$focused.set(false);
    this._onTouched();
  }

  protected readonly $highlightedChip = signal<TKey | undefined>(undefined);
  protected chipClicked(key: TKey) {
    if (this.$disabled()) {
      return; // Do not allow interaction if the control is disabled
    }
    // Prevent the click event from propagating to the host element
    const highlighted = this.$highlightedChip();
    if (highlighted === undefined || !this.$keyComparer()(highlighted, key)) {
      this.$highlightedChip.set(key);
    } else {
      this.$highlightedChip.set(undefined); // Unset highlighted chip if it was already selected
    }

    // event.stopPropagation();
    // event.preventDefault();
  }

  protected inputKeydown(event: KeyboardEvent) {
    if (this.$disabled()) {
      return; // Do not allow interaction if the control is disabled
    }
    const inputEl = event.target as HTMLInputElement;
    const caretStart = inputEl.selectionStart ?? 0;
    const caretEnd = inputEl.selectionEnd ?? 0;
    switch (event.key) {
      case 'Backspace':
        {
          // if caret was not at the start or had selection, skip
          if (caretStart !== 0 || caretEnd !== 0) {
            return;
          }
          event.preventDefault();
          // if there is a highlighted chip, remove it
          const highlightedChip = this.$highlightedChip();
          if (highlightedChip !== undefined) {
            const index = this.$currentKeys().findIndex(k => this.$keyComparer()(k, highlightedChip));
            this.remove(highlightedChip);
            // select the previous chip if it exists
            if (index > 0) {
              this.$highlightedChip.set(this.$currentKeys()[index - 1]);
            }
          } else {
            this.$highlightedChip.set(this.$currentKeys().length > 0 ? this.$currentKeys()[this.$currentKeys().length - 1] : undefined);
          }
        }
        return;
      case 'Delete':
        {
          const highlightedChip = this.$highlightedChip();
          // if caret was not at the start or had selection, skip
          if (highlightedChip === undefined) {
            return;
          }
          event.preventDefault();
          const index = this.$currentKeys().findIndex(k => this.$keyComparer()(k, highlightedChip));
          this.remove(highlightedChip);
          // select the new chip at the same index if it exists
          window.requestAnimationFrame(() => {
            if (index < this.$currentKeys().length) {
              this.$highlightedChip.set(this.$currentKeys()[index]);
            }
          });
        }
        return;
      case 'ArrowLeft':
        {
          // if caret was not at the start or had selection, skip
          if (caretStart !== 0 || caretEnd !== 0) {
            return;
          }
          event.preventDefault();
          const highlightedChip = this.$highlightedChip();
          if (highlightedChip !== undefined) {
            const index = this.$currentKeys().findIndex(k => this.$keyComparer()(k, highlightedChip));
            if (index > 0) {
              this.$highlightedChip.set(this.$currentKeys()[index - 1]);
            }
          } else {
            // if no chip is highlighted, highlight the last chip
            const lastKey = this.$currentKeys().length > 0 ? this.$currentKeys()[this.$currentKeys().length - 1] : undefined;
            this.$highlightedChip.set(lastKey);
          }
        }
        return;
      case 'ArrowRight':
        {
          const highlightedChip = this.$highlightedChip();
          if (highlightedChip === undefined) {
            return;
          }
          event.preventDefault();
          const index = this.$currentKeys().findIndex(k => this.$keyComparer()(k, highlightedChip));
          if (index < this.$currentKeys().length - 1) {
            this.$highlightedChip.set(this.$currentKeys()[index + 1]);
          } else {
            this.$highlightedChip.set(undefined); // unset highlighted chip if it was the last one
          }
        }
        return;
      default:
        this.$highlightedChip.set(undefined); // unset highlighted chip on any other key
        this.$searchKeydown.emit(event);
        break;
    }
  }

  // #endregion

  // #region Form Integration

  // A copy, so the control never changes the array the form holds; null is no chips
  writeValue(val: TKey[] | null): void {
    this.$keys.set(val ? [...val] : []);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange: (val: TKey[]) => void = () => {};
  registerOnChange(fn: (val: TKey[]) => void): void {
    this._onChange = fn;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched: () => void = () => {};
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.$disabled.set(isDisabled);
  }

  // #endregion Form Integration
}
