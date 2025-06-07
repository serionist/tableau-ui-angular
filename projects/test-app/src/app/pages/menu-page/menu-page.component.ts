import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IOptionLineContext, SnackService } from 'component-library';
import { BehaviorSubject, debounceTime, startWith, Subject } from 'rxjs';

@Component({
    selector: 'app-menu-page',
    standalone: false,
    templateUrl: './menu-page.component.html',
    styleUrl: './menu-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent {
    snack = inject(SnackService);
}
