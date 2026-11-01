import type { AfterContentInit, OnDestroy, Signal } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, contentChild, effect, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
import { ErrorComponent, HintComponent, LabelComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { generateRandomString } from 'tableau-ui-angular/utils';

// Elements a <label for> can name; any other control is named through aria-labelledby on the element it focuses
const LABELABLE = ['INPUT', 'TEXTAREA', 'SELECT'];

@Component({
  selector: 'tab-form-field',
  standalone: false,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.disabled]': '$inputDisabled()',
    '[attr.aria-disabled]': '$inputDisabled()',
    'style.display': 'grid',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class FormFieldComponent implements AfterContentInit, OnDestroy {
  // custom components go before input, textarea and select so they are found first (some of them have a nested input)
  private readonly inputContainerSelector = 'tab-chip-control,tab-single-select,tab-multi-select,tab-list-single-select,tab-list-multi-select,tab-radio-group,input,textarea,select';
  private readonly id = generateRandomString(16);
  protected readonly labelId = `${this.id}-label`;
  protected readonly hintId = `${this.id}-hint`;
  protected readonly errorId = `${this.id}-error`;
  /** The label's `for`: the id of a native input, textarea or select, which keeps an id the app gave it */
  protected readonly $labelFor = signal<string | null>(null);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $labelElement: Signal<LabelComponent | undefined> = contentChild(LabelComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $prefixElement: Signal<PrefixComponent | undefined> = contentChild(PrefixComponent);
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  protected readonly $suffixElement: Signal<SuffixComponent | undefined> = contentChild(SuffixComponent);
  private readonly $prefixContainer = viewChild.required<ElementRef<HTMLElement>>('prefixContainer');
  private readonly $suffixContainer = viewChild.required<ElementRef<HTMLElement>>('suffixContainer');
  private readonly $inputContainer = viewChild.required<ElementRef<HTMLElement>>('inputContainer');
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  private readonly $errorContainer: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('errorContainer');
  private readonly $announcer = viewChild.required<ElementRef<HTMLElement>>('announcer');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly renderer = inject(Renderer2);

  protected readonly $inputDisabled = signal(false);
  /** The hints show while no error does, and with it when the first hint has `showOnError` */
  protected readonly $hintShown = computed(() => {
    const hint = this.$hintElement();
    return hint !== undefined && (this.$errorElement() === undefined || hint.$showOnError());
  });
  /**
   * The element the label names and the hint and the error describe: a native input, textarea or select, the chip
   * control's search input, or the host of a select, a list or a radio group
   */
  private readonly $control = signal<HTMLElement | null>(null);
  // Whether the field set the control's aria-invalid, so it takes off only its own
  private invalidMarked = false;
  // The error's words when the field last looked, so the region says only an error that appears or changes
  private lastError = '';

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private inputObserver?: MutationObserver;
  private errorObserver?: MutationObserver;

  // The control is described by the hint, then the error, as each shows, and invalid while the error shows. It runs
  // on the server too, so the first HTML has them
  private readonly describeControl = effect(() => {
    const control = this.$control();
    if (!control) {
      return;
    }
    const error = this.$errorElement() !== undefined;
    const shown = [...(this.$hintShown() ? [this.hintId] : []), ...(error ? [this.errorId] : [])];
    setOwnIds(control, 'aria-describedby', [this.hintId, this.errorId], shown);
    this.markInvalid(control, error);
  });

  constructor() {
    // Observers and measuring need a browser: they start after the first render, which never runs on the server
    afterNextRender(() => {
      this.observe();
    });
  }

  ngAfterContentInit(): void {
    const inputElement = this.findInput();
    if (inputElement) {
      const control = inputElement.tagName === 'TAB-CHIP-CONTROL' ? inputElement.querySelector('input') : inputElement;
      this.labelInput(inputElement, control);
      this.updateInputAttributes(inputElement);
      this.$control.set(control);
    }
  }

  private findInput(): HTMLElement | null {
    return this.$inputContainer().nativeElement.querySelector<HTMLElement>(this.inputContainerSelector);
  }

  /**
   * Names the control by the label. A native input, textarea or select takes the label's `for`, and keeps its own id
   * when it has one. A custom control's host can't be labelled that way, so the element it focuses, the chip control's
   * search input or the host of a select, a list or a radio group, takes the label's id in `aria-labelledby`, after the
   * app's own.
   */
  private labelInput(inputElement: HTMLElement, control: HTMLElement | null) {
    if (!this.$labelElement()) {
      return;
    }
    if (LABELABLE.includes(inputElement.tagName)) {
      if (inputElement.id === '') {
        inputElement.id = this.id;
      }
      this.$labelFor.set(inputElement.id);
      return;
    }
    if (control) {
      setOwnIds(control, 'aria-labelledby', [this.labelId], [this.labelId]);
    }
  }

  // aria-invalid while the error shows. The field takes off only the one it set, so an app's own stays
  private markInvalid(control: HTMLElement, invalid: boolean) {
    if (invalid && !this.invalidMarked && control.getAttribute('aria-invalid') !== 'true') {
      control.setAttribute('aria-invalid', 'true');
      this.invalidMarked = true;
    } else if (!invalid && this.invalidMarked) {
      control.removeAttribute('aria-invalid');
      this.invalidMarked = false;
    }
  }

  private updateInputAttributes(inputElement: HTMLElement) {
    this.$inputDisabled.set(inputElement.getAttribute('disabled') != null);
    const required = inputElement.getAttribute('required') != null && inputElement.getAttribute('required') !== 'false';
    const placeholder = inputElement.getAttribute('placeholder');
    if (placeholder !== null) {
      if (required && !placeholder.endsWith('*')) {
        inputElement.setAttribute('placeholder', `${placeholder}*`);
      }
      if (!required && placeholder.endsWith('*')) {
        inputElement.setAttribute('placeholder', placeholder.slice(0, -1));
      }
    }
  }

  // The error's words, each error's apart; an empty string while none shows
  private errorText(): string {
    const container = this.$errorContainer()?.nativeElement;
    if (!container) {
      return '';
    }
    return Array.from(container.children, error => spokenText(error).replace(/\s+/g, ' ').trim())
      .filter(text => text !== '')
      .join(' ');
  }

  /**
   * Says an error that appears or changes while focus is in the field, through the hidden polite region. One that
   * appears while focus is elsewhere, as on a submit that shows several, stays quiet: the error describes its control,
   * so the user hears it on reaching the field.
   */
  private announceError() {
    const error = this.errorText();
    if (error === this.lastError) {
      return;
    }
    this.lastError = error;
    const host = this.host.nativeElement;
    this.$announcer().nativeElement.textContent = error !== '' && host.contains(host.ownerDocument.activeElement) ? error : '';
  }

  // The region holds an error only while focus is in the field, so a screen reader reading the page doesn't find it twice
  protected onFocusOut(event: FocusEvent) {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.$announcer().nativeElement.textContent = '';
    }
  }

  private observe(): void {
    const inputElement = this.findInput();
    if (inputElement) {
      this.inputObserver = new MutationObserver(() => {
        this.updateInputAttributes(inputElement);
      });
      this.inputObserver.observe(inputElement, {
        attributes: true,
        attributeFilter: ['disabled', 'placeholder', 'required'],
      });
    }
    this.updatePrefixSuffixWidths();

    // The error's words change as tab-error elements come and go, and as their text changes
    this.lastError = this.errorText();
    this.errorObserver = new MutationObserver(() => {
      this.announceError();
    });
    this.errorObserver.observe(this.host.nativeElement, { childList: true, characterData: true, subtree: true });

    // whenever the formFieldWrapper is in view, update the prefix/suffix widths
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.updatePrefixSuffixWidths();
          }
        });
      },
      { threshold: 0.1 },
    );
    this.intersectionObserver.observe(this.host.nativeElement);

    // Observe size changes in prefix and suffix elements to adjust padding dynamically
    this.resizeObserver = new ResizeObserver(() => {
      this.updatePrefixSuffixWidths();
    });
    this.resizeObserver.observe(this.host.nativeElement);
    if (this.$prefixElement()) {
      this.resizeObserver.observe(this.$prefixContainer().nativeElement);
    }
    if (this.$suffixElement()) {
      this.resizeObserver.observe(this.$suffixContainer().nativeElement);
    }
  }
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.inputObserver) {
      this.inputObserver.disconnect();
    }
    if (this.errorObserver) {
      this.errorObserver.disconnect();
    }
  }

  private updatePrefixSuffixWidths(): void {
    const inputElement = this.findInput();
    if (!inputElement) {
      return;
    }
    const prefixElement = this.$prefixElement();
    if (prefixElement) {
      const prefixWidth = prefixElement.elementRef.nativeElement.offsetWidth;
      this.renderer.setStyle(
        inputElement,
        'padding-left',
        `${prefixWidth + 12}px`, // Adds a small margin for spacing
      );
    }
    const suffixElement = this.$suffixElement();
    if (suffixElement) {
      const suffixWidth = suffixElement.elementRef.nativeElement.offsetWidth;
      this.renderer.setStyle(
        inputElement,
        'padding-right',
        `${suffixWidth + 8}px`, // Adds a small margin for spacing
      );
    }
  }
}

/**
 * Writes `ids` last in an id list attribute such as `aria-describedby`, in place of the ids in `own`: the app's ids
 * stay, and the library's own come and go
 */
function setOwnIds(element: Element, attribute: string, own: readonly string[], ids: readonly string[]) {
  const current = element.getAttribute(attribute);
  const kept = (current ?? '').split(/\s+/).filter(id => id !== '' && !own.includes(id));
  const value = [...kept, ...ids].join(' ');
  if (value === '') {
    element.removeAttribute(attribute);
  } else if (value !== current) {
    element.setAttribute(attribute, value);
  }
}

// The words a screen reader says for a node: its text without the parts hidden from it, such as an icon's ligature
function spokenText(node: Node): string {
  if (node instanceof Text) {
    return node.data;
  }
  if (node instanceof Element && node.getAttribute('aria-hidden') === 'true') {
    return '';
  }
  return Array.from(node.childNodes, spokenText).join('');
}
