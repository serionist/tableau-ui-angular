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
import { FormHintComponent } from './form-hint';
import { FormErrorComponent } from './form-error';
import { FormLabelComponent } from './form-label';
import { FormPrefixComponent } from './form-prefix';
import { FormSuffixComponent } from './form-suffix';

@Component({
    selector: 'tab-form-field',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormHintComponent,
        FormErrorComponent,
        FormLabelComponent,
        FormPrefixComponent,
        FormSuffixComponent
    ],
    templateUrl: './form-field.component.html',
    styleUrl: './form-field.component.scss'
})
export class FormFieldComponent implements AfterContentInit, AfterViewInit {
    @ContentChild(FormHintComponent, { static: false }) hintElement: FormHintComponent | undefined;
    @ContentChild(FormErrorComponent) errorElement: FormErrorComponent | undefined;
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
                this.inputContainer.nativeElement.querySelector('input'),
                'padding-left',
                `${prefixWidth + 12}px` // Adds a small margin for spacing
            );
        }

        if (this.suffixElement) {
            const suffixWidth = this.suffixElement.elementRef.nativeElement.offsetWidth;
            this.renderer.setStyle(
                this.inputContainer.nativeElement.querySelector('input'),
                'padding-right',
                `${suffixWidth + 8}px` // Adds a small margin for spacing
            );
        }
    }

}
