import type { Signal, TemplateRef, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, DOCUMENT, effect, inject, model, signal, viewChild } from '@angular/core';

import type { Subscription } from 'rxjs';
import { fromEvent, Subject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import type { DialogRef } from 'tableau-ui-angular/dialog';
import { DialogService, LocalStackOptions } from 'tableau-ui-angular/dialog';
import { generateRandomString } from 'tableau-ui-angular/utils';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
  selector: 'tab-autocomplete',
  standalone: false,
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoCompleteComponent<T extends Primitive> {
  private readonly dialogService = inject(DialogService);
  private readonly document = inject(DOCUMENT);

  protected readonly dropdownId: string;
  protected readonly listboxId: string;

  public readonly selectValue$ = new Subject<OptionComponent<T>>();
  /**
   * The CSS text to apply to the dropdown container
   * @remarks
   * Use this to apply height, maxHeight, etc. to the dropdown container
   * @default '{}'
   */
  readonly $dropdownContainerCss = model<Record<string, string>>(
    {},
    {
      alias: 'dropdownContainerCss',
    },
  );
  /**
   * The CSS text to apply to the options container in the dropdown
   * @remarks
   * Use this to apply height, maxHeight, etc. to the dropdown
   * This is applied to the options container, excluding the prefix & suffix
   *
   * @default "{ maxHeight: '300px', height: 'fit-content'}"
   */
  readonly $dropdownOptionsContainerCss = model<Record<string, string>>(
    {
      maxHeight: '300px',
      height: 'fit-content',
    },
    {
      alias: 'dropdownOptionsContainerCss',
    },
  );
  /**
   * The template context to use for the dropdown options
   * @remarks
   * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
   */
  readonly $dropdownValueTemplateContext = model<IOptionGridContext>(
    {
      renderIcon: true,
      renderText: true,
      renderHint: true,
    },
    {
      alias: 'dropdownValueTemplateContext',
    },
  );

  protected readonly $options = contentChildren<OptionComponent<T>>(OptionComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $dropdownPrefix: Signal<PrefixComponent | undefined> = contentChild<PrefixComponent>(PrefixComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $dropdownSuffix: Signal<SuffixComponent | undefined> = contentChild<SuffixComponent>(SuffixComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $dropdownTemplate: Signal<TemplateRef<null> | undefined> = viewChild<TemplateRef<null>>('dropdownTemplate');

  constructor() {
    const id = generateRandomString();
    this.dropdownId = `dropdown-${id}`;
    this.listboxId = `listbox-${id}`;
    toObservable(this.$options).subscribe(() => {
      this.$highlightedOption.set(undefined);
    });
  }

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  private readonly $openDialog: WritableSignal<{ ref: DialogRef; el: HTMLInputElement } | undefined> = signal<{ ref: DialogRef; el: HTMLInputElement } | undefined>(undefined);
  // The listbox is named as its input is: by aria-labelledby, its label, or aria-label
  protected readonly $listboxName = signal<{ labelledBy: string | null; label: string | null }>({ labelledBy: null, label: null });
  // The highlighted suggestion's id, which the input's aria-activedescendant names
  private readonly $activeDescendant = computed(() => {
    const highlighted = this.$highlightedOption();
    const index = highlighted ? this.$options().findIndex(o => o.$value() === highlighted.$value()) : -1;
    return index === -1 ? null : `${this.listboxId}-${index}`;
  });
  // The input the suggestions are open for is a combobox (WAI-ARIA's pattern) that names the listbox it controls and
  // the highlighted suggestion; this component knows which input that is, so it sets them on it
  private readonly comboboxState = effect(() => {
    const open = this.$openDialog();
    const active = this.$activeDescendant();
    if (open) {
      open.el.setAttribute('aria-expanded', 'true');
      open.el.setAttribute('aria-controls', this.listboxId);
      setOrRemove(open.el, 'aria-activedescendant', active);
    }
  });
  openDropdown(parentControl: HTMLInputElement) {
    if ((parentControl.hasAttribute('disabled') && parentControl.getAttribute('disabled') !== 'false') || parentControl.readOnly) {
      return undefined;
    }
    if (this.$openDialog()) {
      if (this.$openDialog()?.el === parentControl) {
        return this.$openDialog()?.ref;
      }
      this.$openDialog()?.ref.close();
    }
    // a label with an id names the listbox by reference; one without, or one around the input, by its text
    const label = parentControl.labels?.[0];
    const labelledBy = parentControl.getAttribute('aria-labelledby') ?? (label !== undefined && label.id !== '' ? label.id : null);
    const labelText = label?.textContent.trim() ?? '';
    this.$listboxName.set({
      labelledBy,
      label: parentControl.getAttribute('aria-label') ?? (labelledBy === null && labelText !== '' ? labelText : null),
    });
    // each opening starts with no suggestion highlighted, as the select's does
    this.$highlightedOption.set(undefined);

    const ref = this.dialogService.openTemplateDialog(
      this.$dropdownTemplate()!,
      {
        // placed from the input's rect each time the dialog service places it, so it follows the input
        top(actualWidth, actualHeight, rect) {
          if (rect!.bottom + actualHeight > window.innerHeight && rect!.top - actualHeight > 0) {
            return `${rect!.top - actualHeight}px`;
          }
          return `${rect!.bottom}px`;
        },
        left: (actualWidth, actualHeight, rect) => `${rect!.left}px`,
        width: rect => `${rect.width}px`,
        closeOnEscape: true,
        closeOnBackdropClick: true,
        backdropCss: {
          pointerEvents: 'none',
        },
      },
      null,
      new LocalStackOptions(parentControl),
    );

    this.registerKeyNavigation();
    ref.closed$.subscribe(() => {
      this.unregisterKeyNavigation();
      parentControl.setAttribute('aria-expanded', 'false');
      parentControl.removeAttribute('aria-controls');
      parentControl.removeAttribute('aria-activedescendant');
      if (this.$openDialog()?.ref === ref) {
        this.$openDialog.set(undefined);
      }
    });
    this.$openDialog.set({ ref, el: parentControl });
    return ref;
  }
  closeDropdown() {
    this.$openDialog()?.ref.close();
  }

  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $highlightedOption: WritableSignal<OptionComponent<T> | undefined> = signal<OptionComponent<T> | undefined>(undefined);

  protected optionMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private optionKeyNavSubscription: Subscription | undefined;
  private registerKeyNavigation() {
    this.unregisterKeyNavigation();
    this.optionKeyNavSubscription = fromEvent<KeyboardEvent>(this.document, 'keydown').subscribe(e => {
      this.onKeyDown(e);
    });
  }
  private unregisterKeyNavigation() {
    if (this.optionKeyNavSubscription) {
      this.optionKeyNavSubscription.unsubscribe();
      this.optionKeyNavSubscription = undefined;
    }
  }
  /**
   *
   * @param e Handles KeyDown event for:
   * - host element
   * - global keydown event when dropdown is open
   * @returns
   */
  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      // if dropdown is not open
      if (this.$openDialog()) {
        // if dropdown is open
        // if an option is highlighted, select it
        if (this.$highlightedOption()) {
          this.selectValue$.next(this.$highlightedOption()!);
          e.preventDefault();
          e.stopPropagation();
        } else {
          // if an option is not highlighted, close the dropdown, and let Enter do what it does, such as submit a form
          this.$openDialog()?.ref.close();
        }
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // if dropdown is open:
      // - we find the currently HIGHLIGHTED option
      // - we find the next option to highlight
      // - if no option is found, we highlight the first/last option
      // if dropdown is NOT open:
      // - if this is a multiselect, ignore
      // - if this is a single select, find the next item to select
      // - if no item is selected, highlight the first/last item

      if (!this.$openDialog()) {
        return;
      }

      let currentIndex = -1;
      if (this.$highlightedOption()) {
        currentIndex = this.$options().findIndex(o => o.$value() === this.$highlightedOption()!.$value());
      }
      let nextIndex: number;
      // find the next index to highlight/select
      if (e.key === 'ArrowDown') {
        if (currentIndex === -1) {
          // find the first non disabled option
          nextIndex = this.$options().findIndex(o => !o.$disabled());
        } else {
          // find the next option that is not disabled
          nextIndex = this.$options().findIndex((o, i) => i > currentIndex && !o.$disabled());
          // if no option is found, find the next option that is not disabled before the current item
          if (nextIndex === -1) {
            nextIndex = this.$options().findIndex((o, i) => i < currentIndex && !o.$disabled());
          }
        }
      } else if (e.key === 'ArrowUp') {
        if (currentIndex === -1) {
          // find the last non disabled option
          nextIndex = this.$options()
            .slice()
            .reverse()
            .findIndex(o => !o.$disabled());
          if (nextIndex !== -1) {
            nextIndex = this.$options().length - nextIndex - 1;
          }
        } else {
          const flippedCurrentIndex = this.$options().length - currentIndex - 1;
          // find the next option that is not disabled
          nextIndex = [...this.$options()].reverse().findIndex((o, i) => i > flippedCurrentIndex && !o.$disabled());
          // if no option is found, find the next option that is not disabled before the current item
          if (nextIndex === -1) {
            nextIndex = [...this.$options()].reverse().findIndex((o, i) => i < flippedCurrentIndex && !o.$disabled());
          }
          if (nextIndex !== -1) {
            nextIndex = this.$options().length - nextIndex - 1;
          }
        }
      } else {
        nextIndex = -1;
      }

      if (nextIndex !== -1) {
        this.$highlightedOption.set(this.$options()[nextIndex]);

        setTimeout(
          () =>
            this.document.querySelector(`#${this.dropdownId} .option-wrapper.highlight`)?.scrollIntoView({
              block: 'nearest',
            }),
          10,
        );
      }

      e.preventDefault();
      e.stopPropagation();
    }
  }
}

function setOrRemove(element: HTMLElement, name: string, value: string | null) {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}
