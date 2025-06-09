import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { ErrorComponent, HintComponent, LabelComponent, OptionComponent, type IOptionGridContext } from 'tableau-ui-angular/common';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { FB } from 'tableau-ui-angular/form';
import { importFormBuilderProvider, importFormPipes } from 'tableau-ui-angular/form/imports';
import { ListComponent, type ListValue } from 'tableau-ui-angular/list';
import { SnackService } from 'tableau-ui-angular/snack';
import { importSnackProvider } from 'tableau-ui-angular/snack/imports';
import type { ImportModel } from '../../components/import-details/import-model';
import { importList } from 'tableau-ui-angular/list/imports';
import { importFormField } from 'tableau-ui-angular/form-field/imports';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';

@Component({
    selector: 'app-list-page',
    imports: [...importSeparator(), ...importList(), ...importFormField(), ...importFormPipes(), ImportDetailsComponent],
    standalone: true,
    templateUrl: './list-page.component.html',
    styleUrl: './list-page.component.scss',
    providers: [...importSnackProvider(), ...importFormBuilderProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPageComponent implements OnInit {
    b = inject(FB);
    snack = inject(SnackService);

    imports: ImportModel = {
        name: 'List',
        componentImports: [
            {
                name: 'ListComponent',
                from: 'tableau-ui-angular/list',
                info: 'Component for displaying a list of options with single or multiple selection capabilities.',
            },
        ],
        optionalComponentImports: [
            {
                name: 'OptionComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for defining individual options within the list.',
            },
            {
                name: 'LabelComponent',
                from: 'tableau-ui-angular/common',
                info: 'Component for displaying labels associated with the list.',
            },
            {
                name: 'HintComponent',
                from: 'tableau-ui-angular/common',
                info: 'Optional component for displaying hints related to the list.',
            },
            {
                name: 'ErrorComponent',
                from: 'tableau-ui-angular/common',
                info: 'Optional component for displaying validation errors related to the list.',
            },
            {
                name: 'ReactiveFormsModule',
                from: '@angular/forms',
                info: 'Optional import for using list with reactive forms.',
            },
        ],
        importFunctions: [
            {
                name: 'importList',
                from: 'tableau-ui-angular/list/imports',
                info: 'Imports list component and all its dependencies.',
            },
        ],
        optionalImportFunctions: [
            {
                name: 'importFormField',
                from: 'tableau-ui-angular/form-field/imports',
                info: 'Imports form field component to integrate with form fields, show labels, errors, hints, etc.',
            },
            {
                name: 'importFormPipes',
                from: 'tableau-ui-angular/form/imports',
                info: 'Imports form pipes for BetterForms integration.',
            },
        ],
        optionalProviderImportFunctions: [
            {
                name: 'importFormBuilderProvider',
                from: 'tableau-ui-angular/form/imports',
                info: 'Provides FormBuilder for creating BetterForm controls and groups.',
            },
        ],
    };

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $singleSelectValue: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
    singleSelectValueChanged(val: ListValue) {
        this.$singleSelectValue.set(val as number);
        console.log('single select value changed', val);
        this.snack.openSnack('Single select value changed to: ' + val?.toString());
    }

    singleFormControl = this.b.control<number | undefined>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl2 = this.b.control<number | undefined>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    singleFormControl3 = this.b.control<number | undefined>(4, [Validators.required, Validators.min(1), Validators.max(3)]);
    disabledSingleFormControl = this.b.control<number | undefined>(2, undefined, undefined, true);

    multiFormControl = this.b.control<number[] | undefined>([1, 3], [Validators.required]);

    ngOnInit(): void {
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
        const [firstName, lastName] = fullName.split(' ');
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
