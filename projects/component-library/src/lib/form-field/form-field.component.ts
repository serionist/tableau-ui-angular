import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    ContentChild,
    ContentChildren,
    effect,
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

@Component({
    selector: 'tab-form-field',
    templateUrl: './form-field.component.html',
    styleUrl: './form-field.component.scss',
    host: {
        'class.disabled': 'inputDisabled()',
        '[attr.aria-disabled]': 'inputDisabled()',
        'style.display': 'grid'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FormFieldComponent
    implements AfterContentInit, AfterViewInit, OnDestroy
{
    style = input<string>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    labelElement: Signal<FormLabelComponent | undefined> = contentChild(FormLabelComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    prefixElement: Signal<PrefixComponent | undefined> = contentChild(PrefixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    suffixElement: Signal<SuffixComponent | undefined> = contentChild(SuffixComponent);
    prefixContainer = viewChild.required<ElementRef>('prefixContainer');
    suffixContainer = viewChild.required<ElementRef>('suffixContainer');
    inputContainer = viewChild.required<ElementRef>('inputContainer');
    host = inject(ElementRef<HTMLElement>);

    renderer = inject(Renderer2);

    inputDisabled = signal(false);

    resizeObserver?: ResizeObserver;
    intersectionObserver?: IntersectionObserver;
    inputObserver?: MutationObserver;

    prefixOrSuffixChanged = effect(() => {
        const prefix = this.prefixElement();
        const suffix = this.suffixElement();
        this.updatePrefixSuffixWidths();
    })
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

    ngAfterContentInit(): void {
        this.updatePrefixSuffixWidths();

        const input: HTMLElement =
            this.inputContainer().nativeElement.querySelector('input,textarea,tab-select,tab-list');
        if (input) {
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
        this.inputDisabled.set(input.getAttribute('disabled') != null);
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
            { threshold: 0.1 }
        );
        this.intersectionObserver.observe(this.host.nativeElement);

        // Observe size changes in prefix and suffix elements to adjust padding dynamically
        this.resizeObserver = new ResizeObserver(() => {
            this.updatePrefixSuffixWidths();
        });
        this.resizeObserver.observe(this.host.nativeElement);
        if (this.prefixElement()) {
            this.resizeObserver.observe(this.prefixContainer().nativeElement);
        }
        if (this.suffixElement()) {
            this.resizeObserver.observe(this.suffixContainer().nativeElement);
        }
    }

    private updatePrefixSuffixWidths(): void {
        const prefixElement = this.prefixElement();
        if (prefixElement) {
            const prefixWidth =
                prefixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer().nativeElement.querySelector(
                    'input,textarea,tab-select,tab-list'
                ),
                'padding-left',
                `${prefixWidth + 12}px` // Adds a small margin for spacing
            );
        }
        const suffixElement = this.suffixElement();
        if (suffixElement) {
            const suffixWidth =
                suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer().nativeElement.querySelector(
                    'input,textarea,tab-select,tab-list'
                ),
                'padding-right',
                `${suffixWidth + 8}px` // Adds a small margin for spacing
            );
        }
    }
}
