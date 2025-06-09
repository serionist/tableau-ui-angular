import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@Component({
    selector: 'app-navbar-page',
    imports: [TableauUiCommonModule],
    standalone: true,
    templateUrl: './navbar-page.component.html',
    styleUrl: './navbar-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPageComponent {}
