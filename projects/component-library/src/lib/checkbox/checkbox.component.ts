import { NgIf } from '@angular/common';
import { Component, ContentChild, contentChild, ElementRef, forwardRef, Input, input, model, signal, ViewChild } from '@angular/core';
import { CheckboxControlValueAccessor, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';

@Component({
    selector: 'tab-checkbox',
    standalone: true,
    host: {
        'class': 'checkbox',
        '[class.disabled]': 'disabled()',
        '[class.checked]': 'value()',
        '(click)': 'toggleValue()',
    },
    templateUrl: 'checkbox.component.html',
    styleUrls: ['checkbox.component.scss'],
    imports: [NgIf, HintComponent, ErrorComponent],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => CheckboxComponent),
          multi: true
        }
      ]
})
export class CheckboxComponent implements ControlValueAccessor {
    disabled = model(false);
    value = model(false);
    @ContentChild(HintComponent, { static: false }) hintElement: ElementRef | undefined;
    @ContentChild(ErrorComponent, { static: false }) errorElement: ElementRef | undefined;

    onChange = (value: any) => {};
    onTouched = () => {};
    writeValue(value: any): void {
        this.value.set(value);
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
    toggleValue() {
        if (!this.disabled()) {
            const newVal = !this.value();
            this.value.set(newVal);
            this.onChange(this.value());
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                this.toggleValue();
                e.preventDefault();
                break;
            default:
                return;
        }
    }       

}
