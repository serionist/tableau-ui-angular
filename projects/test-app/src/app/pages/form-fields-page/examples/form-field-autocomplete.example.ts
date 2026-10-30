import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { TableauUiAutoCompleteModule } from 'tableau-ui-angular/autocomplete';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

const NAMES = [
  'John Smith',
  'Jane Doe',
  'Michael Johnson',
  'Emily Davis',
  'William Brown',
  'Olivia Wilson',
  'James Taylor',
  'Sophia Martinez',
  'Benjamin Lee',
  'Isabella Anderson',
  'Henry Thomas',
  'Mia Jackson',
  'Daniel White',
  'Charlotte Harris',
  'Matthew Clark',
  'Amelia Lewis',
  'Andrew Walker',
  'Harper Young',
  'David Hall',
  'Evelyn Allen',
];

@Component({
  selector: 'app-form-field-autocomplete-example',
  imports: [TableauUiAutoCompleteModule, TableauUiCommonModule, TableauUiFormFieldModule, TableauUiIconModule],
  templateUrl: './form-field-autocomplete.example.html',
  styleUrl: './form-field-autocomplete.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldAutocompleteExampleComponent {
  protected readonly $search = signal('');
  protected readonly $searching = signal(false);
  protected readonly $results = signal(NAMES);
  protected readonly $count = computed(() => this.$results().length);

  private readonly typed = new Subject<string>();

  constructor() {
    // A search that takes a second, as a server's would, once the user stops typing
    this.typed.pipe(debounceTime(200), takeUntilDestroyed()).subscribe(search => {
      this.$searching.set(true);
      setTimeout(() => {
        const words = search.toLowerCase().split(' ');
        this.$results.set(NAMES.filter(name => words.every(word => name.toLowerCase().includes(word))));
        this.$searching.set(false);
      }, 1000);
    });
  }

  protected input(event: Event) {
    const { value } = event.target as HTMLInputElement;
    this.$search.set(value);
    this.typed.next(value);
  }
}
