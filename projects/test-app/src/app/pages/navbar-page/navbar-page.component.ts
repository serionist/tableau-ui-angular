import { ChangeDetectionStrategy, Component } from '@angular/core';
import { importSeparator } from 'tableau-ui-angular/common/imports';

@Component({
    selector: 'app-navbar-page',
    imports: [...importSeparator()],
    standalone: true,
    templateUrl: './navbar-page.component.html',
    styleUrl: './navbar-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPageComponent {}
