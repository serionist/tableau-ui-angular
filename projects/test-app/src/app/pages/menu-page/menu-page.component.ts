import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { SnackService, TableauUiSnackModule } from 'tableau-ui-angular/snack';

@Component({
    selector: 'app-menu-page',
    imports: [TableauUiSnackModule, TableauUiCommonModule, TableauUiMenuModule],
    standalone: true,
    templateUrl: './menu-page.component.html',
    styleUrl: './menu-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {
    snack = inject(SnackService);
}
