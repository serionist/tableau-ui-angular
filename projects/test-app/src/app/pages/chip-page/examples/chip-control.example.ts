import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import type { ChipData } from 'tableau-ui-angular/chip-control';
import { TableauUiChipControlModule } from 'tableau-ui-angular/chip-control';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
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
  selector: 'app-chip-control-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule, TableauUiChipModule, TableauUiChipControlModule, TableauUiCommonModule, TableauUiFormFieldModule],
  templateUrl: './chip-control.example.html',
  styleUrl: './chip-control.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipControlExampleComponent {
  // The chips by key, and by key and value: setting either one sets the other
  protected readonly $keys = signal<number[]>([]);
  protected readonly $values = signal<ChipData<number, City>[]>([]);
  protected readonly $disabled = signal(false);
  protected readonly $keysText = computed(() => this.$keys().join(', ') || 'none');

  // What a key shows, for keys set without their value: a lookup, as a server call would be. The chips wait for it
  protected readonly getValuesByKeys = async (keys: number[]): Promise<ChipData<number, City>[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return CITIES.filter(city => keys.includes(city.id)).map(city => ({ key: city.id, value: city }));
  };

  protected addByKey() {
    const keys = this.nextCities().map(city => city.id);
    this.$keys.update(current => [...current, ...keys]);
  }

  protected addByValue() {
    const values = this.nextCities().map(city => ({ key: city.id, value: city }));
    this.$values.update(current => [...current, ...values]);
  }

  protected removeFirstByKey() {
    this.$keys.update(current => current.slice(1));
  }

  protected removeLastByValue() {
    this.$values.update(current => current.slice(0, -1));
  }

  // The next two cities without a chip
  private nextCities() {
    const keys = this.$keys();
    return CITIES.filter(city => !keys.includes(city.id)).slice(0, 2);
  }
}
