import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiDrawerModule } from 'tableau-ui-angular/drawer';
import { TableauUiCheckboxModule } from '../../../../../component-library/checkbox/src/tableau-ui-checkbox.module';

@Component({
    selector: 'app-drawer-page',
    imports: [TableauUiCommonModule, TableauUiDrawerModule, TableauUiCheckboxModule],
    standalone: true,
    templateUrl: './drawer-page.component.html',
    styleUrl: './drawer-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerPageComponent {
    readonly $leftDrawerOpen = model<boolean>(false);
    readonly $rightDrawerOpen = model<boolean>(true);
}
