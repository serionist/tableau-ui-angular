import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    inject,
    OnDestroy,
    QueryList,
    Renderer2,
    signal,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';
import { FormLabelComponent } from './form-label';
import { FormPrefixComponent } from './form-prefix';
import { FormSuffixComponent } from './form-suffix';

@Component({
    selector: 'tab-form-field',
    templateUrl: './form-field.component.html',
    styleUrl: './form-field.component.scss',
})
export class FormFieldComponent
    implements AfterContentInit, AfterViewInit, OnDestroy
{
    @ContentChild(HintComponent, { static: false }) hintElement:
        | HintComponent
        | undefined;
    @ContentChild(ErrorComponent) errorElement: ErrorComponent | undefined;
    @ContentChild(FormLabelComponent, { static: false }) labelElement:
        | FormLabelComponent
        | undefined;
    @ContentChild(FormPrefixComponent, { static: false }) prefixElement:
        | FormPrefixComponent
        | undefined;
    @ContentChild(FormSuffixComponent, { static: false }) suffixElement:
        | FormSuffixComponent
        | undefined;
    @ViewChild('prefixContainer', { static: false, read: ElementRef })
    prefixContainer!: ElementRef;
    @ViewChild('suffixContainer', { static: false, read: ElementRef })
    suffixContainer!: ElementRef;

    @ViewChild('inputContainer', { static: true, read: ElementRef })
    inputContainer!: ElementRef;
    @ViewChild('formFieldWrapper', { static: false })
    formFieldWrapper!: ElementRef;
    renderer = inject(Renderer2);

    inputDisabled = signal(false);

    resizeObserver?: ResizeObserver;
    intersectionObserver?: IntersectionObserver;
    inputObserver?: MutationObserver;
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

        const input =
            this.inputContainer.nativeElement.querySelector('input,textarea');
        if (input) {
            this.inputDisabled.set(input.disabled);

            this.inputObserver = new MutationObserver(() => {
                this.inputDisabled.set(input.disabled);
            });
            this.inputObserver.observe(input, {
                attributes: true,
                attributeFilter: ['disabled'],
            });
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
        this.intersectionObserver.observe(this.formFieldWrapper.nativeElement);

        // Observe size changes in prefix and suffix elements to adjust padding dynamically
        this.resizeObserver = new ResizeObserver(() => {
            this.updatePrefixSuffixWidths();
        });
        this.resizeObserver.observe(this.formFieldWrapper.nativeElement);
        if (this.prefixElement) {
            this.resizeObserver.observe(this.prefixContainer.nativeElement);
        }
        if (this.suffixElement) {
            this.resizeObserver.observe(this.suffixContainer.nativeElement);
        }
    }

    private updatePrefixSuffixWidths(): void {
        if (this.prefixElement) {
            const prefixWidth =
                this.prefixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer.nativeElement.querySelector(
                    'input,textarea'
                ),
                'padding-left',
                `${prefixWidth + 12}px` // Adds a small margin for spacing
            );
        }

        if (this.suffixElement) {
            const suffixWidth =
                this.suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer.nativeElement.querySelector(
                    'input,textarea'
                ),
                'padding-right',
                `${suffixWidth + 8}px` // Adds a small margin for spacing
            );
        }
    }
}
