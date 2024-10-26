import { Component, ContentChild, ContentChildren, forwardRef, OnInit, signal } from '@angular/core';
import { OptionComponent } from '../common/option';
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
      multi: true
    }
  ]
})
export class RadiogroupComponent implements ControlValueAccessor{
  
  disabled = signal(false);
  value = signal<any>(undefined);
  name = this.generateRandomGroupName();
  @ContentChildren(OptionComponent) options: OptionComponent[] = [];
  @ContentChild(ErrorComponent, { static: false }) errorElement: ErrorComponent | undefined;


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
      if (!this.disabled()) {
          this.value.set(option.value());
          this.onChange(this.value());
          this.onTouched();
          console.log(this.value(), option.value());
      }
  }

  onKeyDown(e: KeyboardEvent, option: OptionComponent) {
      if (e.key === 'Enter' || e.key === ' ') {
          this.selectValue(option);
          e.preventDefault();
      }
  }

  generateRandomGroupName(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomName += characters.charAt(randomIndex);
    }
  
    return `group-${randomName}`;
  }
}
