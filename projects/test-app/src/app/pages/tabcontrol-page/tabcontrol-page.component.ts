import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';

@Component({
    selector: 'app-tabcontrol-page',
    imports: [TableauUiCommonModule, TableauUiTabgroupModule],
    standalone: true,
    templateUrl: './tabcontrol-page.component.html',
    styleUrl: './tabcontrol-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabcontrolPageComponent {
    tabInit(id: string): void {
        console.log(`${id} activated`);
    }
}
