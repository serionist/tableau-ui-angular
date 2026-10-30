import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiChipControlModule } from '../../../../../component-library/chip-control/src/tableau-ui-chip-control.module';
import { data } from '../table-page/table-data-sample';
import type { DataType } from '../table-page/table-data-sample';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import type { ChipData } from 'tableau-ui-angular/chip-control';
import { TableauUiButtonToggleModule } from '../../../../../component-library/button-toggle/src/tableau-ui-button-toggle.module';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chip-page',
  imports: [
    TableauUiChipModule,
    TableauUiIconModule,
    TableauUiCommonModule,
    ReactiveFormsModule,
    TableauUiChipControlModule,
    TableauUiButtonModule,
    TableauUiButtonToggleModule,
    TableauUiFormModule,
    TableauUiFormFieldModule,
  ],
  standalone: true,
  templateUrl: './chip-page.component.html',
  styleUrl: './chip-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipPageComponent {
  private readonly fb = inject(FB);
  readonly allData: DataType[] = data;

  readonly $selectedKeys = signal<number[]>([], {
    equal: () => false,
  });
  readonly $selectedValues = signal<ChipData<number, DataType>[]>([], {
    equal: () => false,
  });

  readonly $disabled = signal<boolean>(false);

  readonly getValuesByKeys = async (keys: number[]) => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate async operation

    return keys.map(key => ({ key, value: this.allData.find(item => item.id === key) }) as ChipData<number, DataType>);
  };

  private keyCounter = 1;
  addKeys() {
    const keys = [this.keyCounter++, this.keyCounter++];
    this.$selectedKeys.update(currentKeys => [...currentKeys, ...keys]);
  }
  addValues() {
    const keys = [this.keyCounter++, this.keyCounter++];
    const values = keys.map(key => this.allData.find(item => item.id === key));
    this.$selectedValues.update(vals => {
      keys.forEach((key, index) => {
        if (values[index]) {
          vals.push({ key, value: values[index] });
        }
      });
      return [...vals];
    });
  }

  removeRandomKey() {
    const keys = this.$selectedKeys();
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      this.$selectedKeys.update(currentKeys => currentKeys.filter(key => key !== randomKey));
    }
  }
  removeRandomValue() {
    const values = this.$selectedValues();
    if (values.length > 0) {
      const randomValue = values[Math.floor(Math.random() * values.length)];
      this.$selectedValues.update(vals => {
        const newValues = vals.filter(val => val.key !== randomValue.key);

        return newValues;
      });
    }
  }

  readonly fc = this.fb.control<number[]>([], [Validators.minLength(1), Validators.required, Validators.maxLength(5)]);

  addFormKeys() {
    const keys = [this.keyCounter++, this.keyCounter++];
    this.fc.setValue([...this.fc.$value(), ...keys]);
  }
  addFormValues() {
    const keys = [this.keyCounter++, this.keyCounter++];
    const values = keys.map(key => this.allData.find(item => item.id === key));
    const currentValues = this.fc.$value();
    keys.forEach((key, index) => {
      if (values[index]) {
        currentValues.push(key);
      }
    });
    this.fc.setValue([...currentValues]);
  }
  removeRandomFormKey() {
    const keys = this.fc.$value();
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      this.fc.setValue(keys.filter(key => key !== randomKey));
    }
  }
  removeRandomFormValue() {
    const keys = this.fc.$value();
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      this.fc.setValue(keys.filter(key => key !== randomKey));
    }
  }
}
