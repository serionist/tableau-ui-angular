import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, contentChild, ElementRef, forwardRef, Input, input, model, output, Signal, signal, ViewChild } from '@angular/core';
import { CheckboxControlValueAccessor, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';

@Component({
    selector: 'tab-checkbox',
    host: {
        'class': 'checkbox',
        '[class.disabled]': 'disabled()',
        '[class.checked]': 'value()',
        '(click)': 'toggleValue()',
    },
    templateUrl: 'checkbox.component.html',
    styleUrls: ['checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CheckboxComponent implements ControlValueAccessor {
    disabled = model(false);
    value = model(false);
    valueChanges = output<boolean>();

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

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
            this.valueChanges.emit(newVal);
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
