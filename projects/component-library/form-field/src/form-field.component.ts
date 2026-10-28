import type { AfterContentInit, OnDestroy, Signal } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, contentChild, ElementRef, inject, Renderer2, signal, viewChild } from '@angular/core';
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
  },
})
export class FormFieldComponent implements AfterContentInit, OnDestroy {
  // custom components go before input, textarea and select so they are found first (some of them have a nested input)
  private readonly inputContainerSelector = 'tab-chip-control,tab-single-select,tab-multi-select,tab-list-single-select,tab-list-multi-select,input,textarea,select';
  private readonly id = generateRandomString(16);
  protected readonly labelId = `${this.id}-label`;
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly renderer = inject(Renderer2);

  protected readonly $inputDisabled = signal(false);

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private inputObserver?: MutationObserver;

  constructor() {
    // Observers and measuring need a browser: they start after the first render, which never runs on the server
    afterNextRender(() => {
      this.observe();
    });
  }

  ngAfterContentInit(): void {
    const inputElement = this.findInput();
    if (inputElement) {
      this.labelInput(inputElement);
      this.updateInputAttributes(inputElement);
    }
  }

  private findInput(): HTMLElement | null {
    return this.$inputContainer().nativeElement.querySelector<HTMLElement>(this.inputContainerSelector);
  }

  /**
   * Names the control by the label. A native input, textarea or select takes the label's `for`, and keeps its own id
   * when it has one. A custom control's host can't be labelled that way, so the element it focuses, the chip control's
   * search input or the host of a select or list, takes `aria-labelledby`.
   */
  private labelInput(inputElement: HTMLElement) {
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
    const focused = inputElement.tagName === 'TAB-CHIP-CONTROL' ? inputElement.querySelector('input') : inputElement;
    focused?.setAttribute('aria-labelledby', this.labelId);
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
