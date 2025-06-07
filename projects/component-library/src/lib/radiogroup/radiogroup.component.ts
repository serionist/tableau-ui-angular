import { ChangeDetectionStrategy, Component, contentChild, ContentChild, contentChildren, ContentChildren, forwardRef, model, OnInit, output, Signal, signal } from '@angular/core';
import { IOptionGridContext, OptionComponent } from '../common/option';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { generateRandomString } from '../utils';

@Component({
    selector: 'tab-radiogroup',
    standalone: false,
    templateUrl: './radiogroup.component.html',
    styleUrl: './radiogroup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadiogroupComponent),
            multi: true,
        },
    ],
})
export class RadiogroupComponent implements ControlValueAccessor {
    readonly $disabled = signal(false);
    readonly $value = model<any>(undefined, {
        alias: 'value',
    });
    readonly $valueChanges = output<any>();
    readonly name = this.generateRandomGroupName();
    readonly $options = contentChildren(OptionComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onChange = (value: any) => {};
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onTouched = () => {};

    writeValue(value: any): void {
        this.$value.set(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.$disabled.set(isDisabled);
    }

    selectValue(option: OptionComponent) {
        if (!this.$disabled() && !option.$disabled()) {
            if (this.$value() !== option.$value()) {
                this.$value.set(option.$value());
                this.onChange(this.$value());
                this.$valueChanges.emit(this.$value());
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
        return `group-${generateRandomString(length)}`;
    }

    optionTemplateContext: IOptionGridContext = {
        renderIcon: true,
        renderText: true,
        renderHint: true,
    };
}
