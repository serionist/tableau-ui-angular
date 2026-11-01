import type { Signal, TemplateRef, WritableSignal } from '@angular/core';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, DOCUMENT, effect, inject, model, signal, untracked, viewChild } from '@angular/core';

import type { Subscription } from 'rxjs';
import { fromEvent, Subject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { DialogRef, DialogService, LocalStackOptions } from 'tableau-ui-angular/dialog';
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

  // The input the suggestions are open for, and the handle openDropdown gave for them, until the user or the app
  // closes them. Their dialog shows only while it has something to show: an empty one took the page's next Escape.
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  private readonly $request: WritableSignal<{ handle: DialogRef; el: HTMLInputElement } | undefined> = signal<{ handle: DialogRef; el: HTMLInputElement } | undefined>(undefined);
  // The dialog, while it shows
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  private readonly $openDialog: WritableSignal<{ ref: DialogRef; el: HTMLInputElement } | undefined> = signal<{ ref: DialogRef; el: HTMLInputElement } | undefined>(undefined);
  // Set while the dialog closes for want of anything to show, which leaves the suggestions open for their input
  private hidingEmpty = false;
  private readonly $hasContent = computed(() => this.$options().length > 0 || this.$dropdownPrefix() !== undefined || this.$dropdownSuffix() !== undefined);
  // The dialog follows the suggestions' content: it closes when nothing matches, and shows again when something does
  private readonly showWhileContent = afterRenderEffect(() => {
    const request = this.$request();
    const hasContent = this.$hasContent();
    untracked(() => {
      const open = this.$openDialog();
      if (request && hasContent && !open) {
        this.showDropdown(request.el);
      } else if (open && !hasContent) {
        this.hidingEmpty = true;
        try {
          open.ref.close();
        } finally {
          this.hidingEmpty = false;
        }
      }
    });
  });
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
  /**
   * Opens the suggestions for an input, and gives their handle, which closes them; the same handle while they stay open
   * for that input. Their dialog shows while there is a suggestion, a prefix or a suffix to show. A disabled or
   * read-only input gets none.
   */
  openDropdown(parentControl: HTMLInputElement) {
    if ((parentControl.hasAttribute('disabled') && parentControl.getAttribute('disabled') !== 'false') || parentControl.readOnly) {
      return undefined;
    }
    const request = this.$request();
    if (request?.el === parentControl) {
      return request.handle;
    }
    request?.handle.close();
    const handle = new DialogRef();
    handle.closed$.subscribe(() => {
      if (this.$request()?.handle === handle) {
        this.$request.set(undefined);
      }
      if (this.$openDialog()?.el === parentControl) {
        this.$openDialog()?.ref.close();
      }
    });
    this.$request.set({ handle, el: parentControl });
    if (untracked(this.$hasContent)) {
      this.showDropdown(parentControl);
    }
    return handle;
  }
  closeDropdown() {
    this.$request()?.handle.close();
  }

  private showDropdown(parentControl: HTMLInputElement) {
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
      // closed by the user, by Escape or a click outside, or by Enter: the suggestions close with it
      if (!this.hidingEmpty && this.$request()?.el === parentControl) {
        this.closeDropdown();
      }
    });
    this.$openDialog.set({ ref, el: parentControl });
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
