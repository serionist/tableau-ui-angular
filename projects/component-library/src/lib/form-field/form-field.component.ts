import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    inject,
    QueryList,
    Renderer2,
    signal,
    ViewChild
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
    styleUrl: './form-field.component.scss'
})
export class FormFieldComponent implements AfterContentInit, AfterViewInit {
    @ContentChild(HintComponent, { static: false }) hintElement: HintComponent | undefined;
    @ContentChild(ErrorComponent) errorElement: ErrorComponent | undefined;
    @ContentChild(FormLabelComponent, { static: false }) labelElement: FormLabelComponent | undefined;
    @ContentChild(FormPrefixComponent, { static: false }) prefixElement: FormPrefixComponent | undefined;
    @ContentChild(FormSuffixComponent, { static: false }) suffixElement: FormSuffixComponent | undefined;
    @ViewChild('inputContainer', { static: true, read: ElementRef }) inputContainer!: ElementRef;
    @ViewChild('formFieldWrapper', { static: false }) formFieldWrapper!: ElementRef;
    renderer = inject(Renderer2);


    ngAfterContentInit(): void {
        this.updatePrefixSuffixWidths();
    }

    ngAfterViewInit(): void {
        // Recalculate when view initializes
        setTimeout(() => this.updatePrefixSuffixWidths());
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.updatePrefixSuffixWidths();
            }
          });
        }, { threshold: 0.1 });
        observer.observe(this.formFieldWrapper.nativeElement);
    }

    private updatePrefixSuffixWidths(): void {
        if (this.prefixElement) {
            const prefixWidth = this.prefixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer.nativeElement.querySelector('input,textarea'),
                'padding-left',
                `${prefixWidth + 12}px` // Adds a small margin for spacing
            );
        }

        if (this.suffixElement) {
            const suffixWidth = this.suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer.nativeElement.querySelector('input,textarea'),
                'padding-right',
                `${suffixWidth + 8}px` // Adds a small margin for spacing
            );
        }
    }

}
