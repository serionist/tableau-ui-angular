import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';

const USERS = [
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
].map((name, index) => ({ id: index + 1, name }));

@Component({
  selector: 'app-select-search-example',
  imports: [ReactiveFormsModule, TableauUiCommonModule, TableauUiFormFieldModule, TableauUiIconModule, TableauUiSelectModule],
  templateUrl: './select-search.example.html',
  styleUrl: './select-search.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSearchExampleComponent {
  protected readonly users = new FormControl<number[]>([], { nonNullable: true });

  protected readonly $search = signal('');
  protected readonly $searching = signal(false);
  protected readonly $results = signal(USERS);
  protected readonly $count = computed(() => this.$results().length);

  private readonly typed = new Subject<string>();

  constructor() {
    // A search that takes a second, as a server's would, once the user stops typing
    this.typed.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(search => {
      this.$searching.set(true);
      setTimeout(() => {
        const words = search.toLowerCase().split(' ');
        this.$results.set(USERS.filter(user => words.every(word => user.name.toLowerCase().includes(word))));
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
