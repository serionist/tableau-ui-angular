import type { AfterContentInit, AfterViewInit, OnDestroy, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, ElementRef, inject, input, Renderer2, signal, viewChild } from '@angular/core';
import { ErrorComponent, HintComponent, LabelComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { generateRandomString } from 'tableau-ui-angular/utils';

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
export class FormFieldComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    private readonly inputContainerSelector = 'input,textarea,tab-single-select,tab-multi-select,tab-list-single-select,tab-list-multi-select';
    protected readonly id = generateRandomString(16);
    readonly $style = input<string>(undefined, {
        alias: 'style',
    });
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

    private readonly $inputDisabled = signal(false);

    private resizeObserver?: ResizeObserver;
    private intersectionObserver?: IntersectionObserver;
    private inputObserver?: MutationObserver;

    ngAfterContentInit(): void {
        this.updatePrefixSuffixWidths();

        const inputElement: HTMLElement | null = this.$inputContainer().nativeElement.querySelector(this.inputContainerSelector);

        if (inputElement) {
            inputElement.id = this.id;
            this.updateInputAttributes(inputElement);

            this.inputObserver = new MutationObserver(() => {
                this.updateInputAttributes(inputElement);
            });
            this.inputObserver.observe(inputElement, {
                attributes: true,
                attributeFilter: ['disabled', 'placeholder', 'required'],
            });
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
    ngAfterViewInit(): void {
        // Recalculate when view initializes
        setTimeout(() => {
            this.updatePrefixSuffixWidths();
        });

        // whenever the formFieldWrapper is in view, update the prefix/suffix widths
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
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
        const prefixElement = this.$prefixElement();
        if (prefixElement) {
            const prefixWidth = prefixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.$inputContainer().nativeElement.querySelector(this.inputContainerSelector),
                'padding-left',
                `${prefixWidth + 12}px`, // Adds a small margin for spacing
            );
        }
        const suffixElement = this.$suffixElement();
        if (suffixElement) {
            const suffixWidth = suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.$inputContainer().nativeElement.querySelector(this.inputContainerSelector),
                'padding-right',
                `${suffixWidth + 8}px`, // Adds a small margin for spacing
            );
        }
    }
}
