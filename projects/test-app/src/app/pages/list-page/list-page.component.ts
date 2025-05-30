import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IOptionGridContext, SnackService } from 'component-library';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';

@Component({
    selector: 'app-list-page',
    templateUrl: './list-page.component.html',
    styleUrl: './list-page.component.scss',
    standalone: false
})
export class ListPageComponent implements OnInit {
   

    snack = inject(SnackService);
// nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    singleSelectValue: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
    singleSelectValueChanged(val: number | undefined) {
        this.singleSelectValue.set(val);
        console.log('single select value changed', val);
        this.snack.openSnack('Single select value changed to: ' + val);
    }


    singleFormControl = new FormControl(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl2 = new FormControl(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl3 = new FormControl(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    disabledSingleFormControl = new FormControl({ value: 2, disabled: true });

    multiFormControl = new FormControl([1, 3], [Validators.required]);

    ngOnInit(): void {
     this.singleFormControl.markAsTouched();
     this.singleFormControl.updateValueAndValidity();
      this.singleFormControl2.markAsTouched();
      this.singleFormControl2.updateValueAndValidity();
      this.singleFormControl3.markAsTouched();
      this.singleFormControl3.updateValueAndValidity();
     this.multiFormControl.valueChanges.subscribe((val) => {
          console.log('multi select value changed', val);
          this.snack.openSnack('Multi select value changed to: ' + val);
      });
      this.searchBounce.pipe(debounceTime(300)).subscribe(() => {
        this.performSearch();
      });
    }
    onlyTextSelectedValue: IOptionGridContext = {
      renderIcon: false,
      renderText: true,
      renderHint: false
    }


    // #region Search
    searchFormControl = new FormControl([]);
    names = [
      "John Smith", "Jane Doe", "Michael Johnson", "Emily Davis", "William Brown",
      "Olivia Wilson", "James Taylor", "Sophia Martinez", "Benjamin Lee", "Isabella Anderson",
      "Henry Thomas", "Mia Jackson", "Daniel White", "Charlotte Harris", "Matthew Clark",
      "Amelia Lewis", "Andrew Walker", "Harper Young", "David Hall", "Evelyn Allen",
      "Joseph Wright", "Ella King", "Charles Scott", "Scarlett Green", "Christopher Adams",
      "Grace Nelson", "Alexander Baker", "Zoey Carter", "Samuel Perez", "Nora Mitchell",
      "Gabriel Roberts", "Lily Turner", "Jack Phillips", "Hannah Campbell", "Owen Parker",
      "Aria Evans", "Lucas Edwards", "Lillian Collins", "Mason Stewart", "Avery Sanchez",
      "Ethan Morris", "Layla Rogers", "Logan Reed", "Penelope Cook", "Jacob Morgan",
      "Victoria Bell", "Sebastian Murphy", "Addison Bailey", "Aiden Cooper", "Riley Rivera"
    ];
    
    randomNames = this.names.map((fullName, index) => {
      const [firstName, lastName] = fullName.split(" ");
      return {
        id: index + 1,
        name: fullName,
        search: this.getSearchString(fullName)
      };
    });

    getSearchString(input: string) {
      return input.split(' ').map(e => e.toLowerCase()).join('|');
    }

    searchValue$ = new BehaviorSubject<string>('');
    searching = signal(false);
    searchResults$ = new BehaviorSubject<{ id: number, name: string }[]>(this.randomNames);

    searchBounce = new Subject<void>();
    searchValueChanged(value: string) {
      this.searchValue$.next(value);
      this.searchBounce.next();
   
    }
    performSearch() {
      this.searching.set(true);
      setTimeout(() => {
        this.searchResults$.next(this.randomNames.filter(e => e.search.includes(this.getSearchString(this.searchValue$.value))));
        this.searching.set(false);
      }, 1000);
    }

    // #endregion
}
