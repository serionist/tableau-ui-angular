import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    forwardRef,
    HostListener,
    inject,
    input,
    model,
    ModelSignal,
    output,
    signal,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: 'input[type=date],input[type=datetime-local],input[type=datetime],input[date-picker]',
    standalone: false,
    host: {
        class: 'date-picker',
        '[attr.type]': 'type() === "datetime" ? "datetime-local" : "date"',
        
    },
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => DatePickerDirective),
          multi: true,
        },
      ],
})
export class DatePickerDirective implements ControlValueAccessor {
   
    private readonly el = inject(ElementRef<HTMLInputElement>);


    type = input.required<'date' | 'datetime'>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    value: ModelSignal<Date | null> = model<Date | null>(null);
    valueChange = output<Date | null>();

    @HostListener('input')
    onInput() {
        let val: Date | null = null;
        if (!this.el.nativeElement.value) {
            val = null;
        } else {
            const date = new Date(this.el.nativeElement.value);
            if (isNaN(date.getTime())) {
                val = null;
            } else {
                val = date;
            }
        }
        this.value.set(val);
        this.valueChange.emit(val);
        this._onChange(val);
    }
    @HostListener('focus')
    onFocus() {
        this._onTouched();
    }

    writeValue(obj: any): void {
        if (obj instanceof Date && !isNaN(obj.getTime())) {
            if (this.type() === 'datetime') {
                this.el.nativeElement.value = obj.toISOString().slice(0, 16);
            } else {
                this.el.nativeElement.value = obj.toISOString().slice(0, 10);
            }
        } else {
            this.el.nativeElement.value = '';

        }
    }
    private _onChange: any = () => { };
    private _onTouched: any = () => { };
    registerOnChange(fn: any): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;

    }

    
      
}
