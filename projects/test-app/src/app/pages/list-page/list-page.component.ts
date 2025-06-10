import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { TableauUiCommonModule, type IOptionGridContext } from 'tableau-ui-angular/common';
import { FB, TableauUiFormModule } from 'tableau-ui-angular/form';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

import { TableauUiListModule } from 'tableau-ui-angular/list';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';

@Component({
    selector: 'app-list-page',
    imports: [TableauUiSnackModule, TableauUiFormModule, TableauUiListModule, TableauUiCommonModule, TableauUiFormFieldModule, TableauUiIconModule],
    standalone: true,
    templateUrl: './list-page.component.html',
    styleUrl: './list-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPageComponent implements OnInit {
    b = inject(FB);
    snack = inject(SnackService);

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $singleSelectValue: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
    singleSelectValueChanged(val: number | undefined) {
        this.$singleSelectValue.set(val);
        console.log('single select value changed', val);
        this.snack.openSnack('Single select value changed to: ' + val?.toString());
    }

    singleFormControl = this.b.control<number | null>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl2 = this.b.control<number | null>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl3 = this.b.control<number | null>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    disabledSingleFormControl = this.b.control<number | null>(2, undefined, undefined, true);

    multiFormControl = this.b.control<number[] | null>([1, 3], [Validators.required]);

    ngOnInit(): void {
        console.log(this.disabledSingleFormControl, this.singleFormControl);
        this.multiFormControl.value$.subscribe((val) => {
            console.log('multi select value changed', val);
            this.snack.openSnack('Multi select value changed to: ' + val?.join(', '));
        });
        this.searchBounce.pipe(debounceTime(300)).subscribe(() => {
            this.performSearch();
        });
    }
    onlyTextSelectedValue: IOptionGridContext = {
        renderIcon: false,
        renderText: true,
        renderHint: false,
    };

    // #region Search
    searchFormControl = new FormControl([]);
    names = [
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
        'Joseph Wright',
        'Ella King',
        'Charles Scott',
        'Scarlett Green',
        'Christopher Adams',
        'Grace Nelson',
        'Alexander Baker',
        'Zoey Carter',
        'Samuel Perez',
        'Nora Mitchell',
        'Gabriel Roberts',
        'Lily Turner',
        'Jack Phillips',
        'Hannah Campbell',
        'Owen Parker',
        'Aria Evans',
        'Lucas Edwards',
        'Lillian Collins',
        'Mason Stewart',
        'Avery Sanchez',
        'Ethan Morris',
        'Layla Rogers',
        'Logan Reed',
        'Penelope Cook',
        'Jacob Morgan',
        'Victoria Bell',
        'Sebastian Murphy',
        'Addison Bailey',
        'Aiden Cooper',
        'Riley Rivera',
    ];

    randomNames = this.names.map((fullName, index) => {
        return {
            id: index + 1,
            name: fullName,
            search: this.getSearchString(fullName),
        };
    });

    getSearchString(input: string) {
        return input
            .split(' ')
            .map((e) => e.toLowerCase())
            .join('|');
    }

    searchValue$ = new BehaviorSubject<string>('');
    readonly $searching = signal(false);
    searchResults$ = new BehaviorSubject<{ id: number; name: string }[]>(this.randomNames);

    searchBounce = new Subject<void>();
    searchValueChanged(value: string) {
        this.searchValue$.next(value);
        this.searchBounce.next();
    }
    performSearch() {
        this.$searching.set(true);
        setTimeout(() => {
            this.searchResults$.next(this.randomNames.filter((e) => e.search.includes(this.getSearchString(this.searchValue$.value))));
            this.$searching.set(false);
        }, 1000);
    }

    // #endregion
}
