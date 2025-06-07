import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    ContentChild,
    ContentChildren,
    ElementRef,
    inject,
    input,
    OnDestroy,
    QueryList,
    Renderer2,
    Signal,
    signal,
    viewChild,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';
import { FormLabelComponent } from './form-label';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';
import { generateRandomString } from '../utils';

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
    protected readonly id = generateRandomString(16);
    readonly $style = input<string>(undefined, {
        alias: 'style',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $labelElement: Signal<FormLabelComponent | undefined> = contentChild(FormLabelComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $prefixElement: Signal<PrefixComponent | undefined> = contentChild(PrefixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $suffixElement: Signal<SuffixComponent | undefined> = contentChild(SuffixComponent);
    private readonly $prefixContainer = viewChild.required<ElementRef>('prefixContainer');
    private readonly $suffixContainer = viewChild.required<ElementRef>('suffixContainer');
    private readonly $inputContainer = viewChild.required<ElementRef>('inputContainer');
    private readonly host = inject(ElementRef<HTMLElement>);

    private readonly renderer = inject(Renderer2);

    private readonly $inputDisabled = signal(false);

    private resizeObserver?: ResizeObserver;
    private intersectionObserver?: IntersectionObserver;
    private inputObserver?: MutationObserver;

    ngAfterContentInit(): void {
        this.updatePrefixSuffixWidths();

        const input: HTMLElement = this.$inputContainer().nativeElement.querySelector('input,textarea,tab-select,tab-list');

        if (input) {
            input.id = this.id;
            this.updateInputAttributes(input);

            this.inputObserver = new MutationObserver(() => {
                this.updateInputAttributes(input);
            });
            this.inputObserver.observe(input, {
                attributes: true,
                attributeFilter: ['disabled', 'placeholder', 'required'],
            });
        }
    }

    private updateInputAttributes(input: HTMLElement) {
        this.$inputDisabled.set(input.getAttribute('disabled') != null);
        const required = input.getAttribute('required') != null && input.getAttribute('required') !== 'false';
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
            if (required && !placeholder.endsWith('*')) {
                input.setAttribute('placeholder', `${placeholder}*`);
            }
            if (!required && placeholder.endsWith('*')) {
                input.setAttribute('placeholder', placeholder.slice(0, -1));
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
                this.$inputContainer().nativeElement.querySelector('input,textarea,tab-select,tab-list'),
                'padding-left',
                `${prefixWidth + 12}px`, // Adds a small margin for spacing
            );
        }
        const suffixElement = this.$suffixElement();
        if (suffixElement) {
            const suffixWidth = suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.$inputContainer().nativeElement.querySelector('input,textarea,tab-select,tab-list'),
                'padding-right',
                `${suffixWidth + 8}px`, // Adds a small margin for spacing
            );
        }
    }
}
