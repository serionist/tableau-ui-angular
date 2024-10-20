import { NgIf } from '@angular/common';
import { Component, ContentChild, contentChild, ElementRef, forwardRef, Input, input, signal, ViewChild } from '@angular/core';
import { CheckboxControlValueAccessor, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TabHintComponent } from '../tab-hint';
import { TabErrorComponent } from '../tab-error';

@Component({
    selector: 'tab-checkbox',
    standalone: true,
    templateUrl: 'checkbox.component.html',
    styleUrls: ['checkbox.component.scss'],
    imports: [NgIf, TabHintComponent, TabErrorComponent],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => CheckboxComponent),
          multi: true
        }
      ]
})
export class CheckboxComponent implements ControlValueAccessor {
    disabled = signal(false);
    value = signal(false);
    @ContentChild(TabHintComponent, { static: false }) hintElement: ElementRef | undefined;
    @ContentChild(TabErrorComponent, { static: false }) errorElement: ElementRef | undefined;

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

}
