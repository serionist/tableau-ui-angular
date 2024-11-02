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
    OnDestroy,
    QueryList,
    Renderer2,
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent
    implements AfterContentInit, AfterViewInit, OnDestroy
{
    hintElement = contentChild(HintComponent);
    errorElement = contentChild(ErrorComponent);
    labelElement = contentChild(FormLabelComponent);
    prefixElement = contentChild(PrefixComponent);
    suffixElement = contentChild(SuffixComponent);
    prefixContainer = viewChild.required<ElementRef>('prefixContainer');
    suffixContainer = viewChild.required<ElementRef>('suffixContainer');
    inputContainer = viewChild.required<ElementRef>('inputContainer');
    formFieldWrapper = viewChild.required<ElementRef>('formFieldWrapper');

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

        const input: HTMLElement =
            this.inputContainer().nativeElement.querySelector('input,textarea,tab-select');
        if (input) {
            this.inputDisabled.set(input.getAttribute('disabled') != null);

            this.inputObserver = new MutationObserver(() => {
                this.inputDisabled.set(input.getAttribute('disabled') != null);
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
        this.intersectionObserver.observe(this.formFieldWrapper().nativeElement);

        // Observe size changes in prefix and suffix elements to adjust padding dynamically
        this.resizeObserver = new ResizeObserver(() => {
            this.updatePrefixSuffixWidths();
        });
        this.resizeObserver.observe(this.formFieldWrapper().nativeElement);
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
                    'input,textarea,tab-select'
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
                    'input,textarea,tab-select'
                ),
                'padding-right',
                `${suffixWidth + 8}px` // Adds a small margin for spacing
            );
        }
    }
}
