import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiTreeModule } from 'tableau-ui-angular/tree';
import { TreeNodeContainerComponent } from './tree-node-container.component';

@Component({
    selector: 'app-tree-page',
    imports: [TableauUiCommonModule, TableauUiTreeModule, TreeNodeContainerComponent],
    standalone: true,
    templateUrl: './tree-page.component.html',
    styleUrl: './tree-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePageComponent {}
