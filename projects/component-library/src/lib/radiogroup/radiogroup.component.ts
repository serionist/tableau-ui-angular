import {
    ChangeDetectionStrategy,
    Component,
    contentChild,
    ContentChild,
    contentChildren,
    ContentChildren,
    forwardRef,
    model,
    OnInit,
    output,
    signal,
} from '@angular/core';
import { IOptionGridContext, OptionComponent } from '../common/option';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'tab-radiogroup',
    templateUrl: './radiogroup.component.html',
    styleUrl: './radiogroup.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadiogroupComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadiogroupComponent implements ControlValueAccessor {
    disabled = signal(false);
    value = model<any>(undefined);
    valueChanges = output<any>();
    name = this.generateRandomGroupName();
    options = contentChildren(OptionComponent);
    errorElement = contentChild(ErrorComponent);

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

    selectValue(option: OptionComponent) {
        if (!this.disabled() && !option.disabled()) {
            if (this.value() !== option.value()) {
                this.value.set(option.value());
                this.onChange(this.value());
                this.valueChanges.emit(this.value());
            }
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent, option: OptionComponent) {
        if (e.key === 'Enter' || e.key === ' ') {
            this.selectValue(option);
            e.preventDefault();
        }
    }

    generateRandomGroupName(length: number = 8): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomName = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomName += characters.charAt(randomIndex);
        }

        return `group-${randomName}`;
    }

    optionTemplateContext: IOptionGridContext = {
        renderIcon: true,
        renderText: true,
        renderHint: true,
    };
}
