import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, effect, forwardRef, input, model, output, signal, untracked, viewChild } from '@angular/core';
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
  }
})
export class ChipControlComponent<TKey, TValue> implements ControlValueAccessor {
  readonly self = this;
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
  readonly $values = model<ChipData<TKey, TValue>[]>([], {
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
    this.$values.update(values => {
      values.push({ key, value });
      return [...values];
    });
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
    this.$values.update(values => {
      const val = values.findIndex(v => this.$keyComparer()(v.key, key));
      if (val !== -1) {
        values.splice(val, 1);
      }
      return [...values];
    });
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

  /**
   * A signal that indicates whether the values are currently being loaded.
   * This is called when the keys are manually changed.
   * Shows a loading indicator on the UI.
   */
  protected readonly $isLoadingValues = signal<boolean>(false);
  private loadChain = Promise.resolve();
  private loadingKeys: TKey[] = [];
  private readonly keysChanged = effect(() => {
    console.log('Keys changed:', this.$keys());
    const keys = this.$keys();
    const values = untracked(() => this.$values());
    const comparer = untracked(() => this.$keyComparer());
    const selectedChip = untracked(() => this.$highlightedChip());
    // keys is the source of truth, so we need to update the values based on the keys

    // remove all values that are not in the keys
    const deleted: TKey[] = [];
    for (const val of values.entries()) {
      if (!keys.some(k => comparer(k, val[1].key))) {
        console.log('Keys changed: Deleting value for key:', val[1].key);
        values.splice(val[0], 1);
        if (selectedChip !== undefined && comparer(selectedChip, val[1].key)) {
          console.log('Keys changed: Unsetting highlighted chip for key:', val[1].key);
          this.$highlightedChip.set(undefined); // unset highlighted chip if it was deleted
        }
        deleted.push(val[1].key);
      }
    }
    if (deleted.length > 0) {
      this.$values.set([...values]);
      console.log(
        'new values after deletion:',
        untracked(() => this.$values()),
      );
      for (const key of deleted) {
        console.log('Keys changed: Emitting chipRemoved for key:', key);
        this.$chipRemoved.emit(key);
      }
      
    }

    this._onChange([...keys]); // notify form control of the change

    
    // add all values that are in the keys but not in the values
    // get which keys are not in the values
    const missingKeys = keys.filter(k => !values.some(vk => comparer(vk.key, k)));

    if (missingKeys.length === 0) {
      console.log('Keys changed: No new keys');
      return;
    }
    console.log('Keys changed: Loading values for missing keys:', missingKeys);
    this.loadChain = this.loadChain.then(async () => {
      const currentKeys = untracked(() => this.$keys());
      const currentValues = untracked(() => this.$values());
      const currentMissing = currentKeys.filter(k => !currentValues.some(vk => comparer(vk.key, k)));

      if (currentMissing.length === 0) {
        console.log('Keys changed async: No missing keys after untracked check');
        return;
      }
      this.$isLoadingValues.set(true);
      this.loadingKeys = [...currentMissing];
      console.log('Keys changed async: Loading started for missing keys:', currentMissing);
      const results = await untracked(() => this.$getValuesByKeys())(currentMissing);
      const newValues: ChipData<TKey, TValue>[] = [];
      console.log('Keys changed async: Results loaded:', results);
      for (const result of results) {
        if (result.value === undefined || currentValues.some(vk => comparer(vk.key, result.key))) {
          console.log(`Keys changed async: Skipping key ${result.key} with value ${result.value} - already exists or is undefined`);
          continue; // skip if value is undefined or already exists
        }
        console.log(`Keys changed async: Adding key ${result.key} with value ${result.value}`);
        newValues.push(result);
      }
      this.$values.set([...currentValues, ...newValues]);

      for (const newValue of newValues) {
        console.log('Keys changed async: Emitting chipAdded for key:', newValue.key);
        this.$chipAdded.emit(newValue);
      }
      this.$isLoadingValues.set(false);
      this.loadingKeys = [];
      this._onChange([...keys]);
      console.log('Keys changed async: Values updated successfully');
    });
  });

  private readonly valuesChanged = effect(() => {
    console.log('Values changed:', this.$values());
    const values = this.$values();
    const keys = untracked(() => this.$keys());
    const comparer = untracked(() => this.$keyComparer());
    const selectedChip = untracked(() => this.$highlightedChip());
    // values is the source of truth, so we need to update the keys based on the values
    // remove all keys that are not in the values
    // also make sure that we track which keys are being loaded currently. they are not going to be in values yet.

    const deletedKeys: TKey[] = [];
    for (const key of [...keys]) {
      if (!values.some(v => comparer(v.key, key)) && !this.loadingKeys.some(loadingKey => comparer(loadingKey, key))) {
        console.log('Values changed: Deleting key:', key);
        keys.splice(keys.indexOf(key), 1);
        if (selectedChip !== undefined && comparer(selectedChip, key)) {
          console.log('Values changed: Unsetting highlighted chip for key:', key);
          this.$highlightedChip.set(undefined); // unset highlighted chip if it was deleted
        }
        deletedKeys.push(key);
      }
    }
    if (deletedKeys.length > 0) {
      this.$keys.set([...keys]);
      for (const key of deletedKeys) {
        console.log('Values changed: Emitting chipRemoved for key:', key);
        this.$chipRemoved.emit(key);
      }
    }
    // add all keys that are in the values but not in the keys
    const missing = values.filter(v => !keys.some(k => comparer(k, v.key)));
    if (missing.length === 0) {
      console.log('Values changed: No new keys');
      return;
    }
    console.log(
      'Values changed: Adding new keys:',
      missing.map(m => m.key),
    );
    this.$keys.set([...keys, ...missing.map(m => m.key)]);
    for (const m of missing) {
      console.log('Values changed: Emitting chipAdded for key:', m.key);
      this.$chipAdded.emit(m);
    }
  });

  // #endregion keys/values change events

  // #region Focus & Selection
  protected readonly $focused = signal<boolean>(false);
  private readonly focusEffect = effect(() => {
    const focused = this.$focused();
    if (focused) {
      this._onTouched();
    }
    this.$searchFocused.emit(focused);
  });

  protected readonly $highlightedChip = signal<TKey | undefined>(undefined);
  protected chipClicked(key: TKey) {
    if (this.$disabled()) {
      return; // Do not allow interaction if the control is disabled
    }
    // Prevent the click event from propagating to the host element
    if (this.$highlightedChip() !== key) {
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
            const index = this.$keys().findIndex(k => this.$keyComparer()(k, highlightedChip));
            this.remove(highlightedChip);
            // select the previous chip if it exists
            if (index > 0) {
              this.$highlightedChip.set(this.$keys()[index - 1]);
            }
          } else {
            this.$highlightedChip.set(this.$keys().length > 0 ? this.$keys()[this.$keys().length - 1] : undefined);
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
          const index = this.$keys().findIndex(k => this.$keyComparer()(k, highlightedChip));
          this.remove(highlightedChip);
          // select the new chip at the same index if it exists
          window.requestAnimationFrame(() => {
            if (index < this.$keys().length) {
              this.$highlightedChip.set(this.$keys()[index]);
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
            const index = this.$keys().findIndex(k => this.$keyComparer()(k, highlightedChip));
            if (index > 0) {
              this.$highlightedChip.set(this.$keys()[index - 1]);
            }
          } else {
            // if no chip is highlighted, highlight the last chip
            const lastKey = this.$keys().length > 0 ? this.$keys()[this.$keys().length - 1] : undefined;
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
          const index = this.$keys().findIndex(k => this.$keyComparer()(k, highlightedChip));
          if (index < this.$keys().length - 1) {
            this.$highlightedChip.set(this.$keys()[index + 1]);
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

  writeValue(val: TKey[]): void {
    this.$keys.set(val);
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
