import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-navbar-page',
    standalone: false,
    templateUrl: './navbar-page.component.html',
    styleUrl: './navbar-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPageComponent {}
