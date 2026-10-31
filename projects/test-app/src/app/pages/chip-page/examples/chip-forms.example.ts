import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import type { ChipData } from 'tableau-ui-angular/chip-control';
import { TableauUiChipControlModule } from 'tableau-ui-angular/chip-control';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';

interface City {
  id: number;
  name: string;
}

const CITIES: readonly City[] = ['Amsterdam', 'Berlin', 'Budapest', 'Copenhagen', 'Dublin', 'Helsinki', 'Lisbon', 'Madrid', 'Oslo', 'Paris', 'Prague', 'Vienna'].map((name, index) => ({
  id: index + 1,
  name,
}));

@Component({
  selector: 'app-chip-forms-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule, TableauUiChipModule, TableauUiChipControlModule, TableauUiCommonModule, TableauUiFormModule, TableauUiFormFieldModule],
  templateUrl: './chip-forms.example.html',
  styleUrl: './chip-forms.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipFormsExampleComponent {
  private readonly fb = inject(FB);

  // The form holds the keys. At least one chip and at most five: each error waits for the control to be touched, as
  // formHasError does, once its text box loses focus
  protected readonly cities = this.fb.control<number[]>([1, 2], [Validators.required, Validators.maxLength(5)]);
  protected readonly $keysText = computed(() => this.cities.$value().join(', '));

  // What each key shows, which the control looks up for the keys the form gives it
  protected readonly getValuesByKeys = async (keys: number[]): Promise<ChipData<number, City>[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return CITIES.filter(city => keys.includes(city.id)).map(city => ({ key: city.id, value: city }));
  };

  protected addTwo() {
    const keys = this.cities.$value();
    const next = CITIES.filter(city => !keys.includes(city.id)).slice(0, 2);
    this.cities.setValue([...keys, ...next.map(city => city.id)]);
  }

  protected removeFirst() {
    this.cities.setValue(this.cities.$value().slice(1));
  }

  // A disabled control disables the chip control
  protected setDisabled(disabled: boolean | 'partial') {
    if (disabled === true) {
      this.cities.metaFn.disable();
    } else {
      this.cities.metaFn.enable();
    }
  }
}
