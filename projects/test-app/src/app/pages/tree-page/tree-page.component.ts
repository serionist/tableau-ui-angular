import { ChangeDetectionStrategy, Component } from '@angular/core';
import { importSeparator } from 'tableau-ui-angular/common/imports';
import { TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective } from 'tableau-ui-angular/tree';
import { importTree } from 'tableau-ui-angular/tree/imports';
import { TreeNodeContainerComponent } from './tree-node-container.component';
import type { ImportModel } from '../../components/import-details/import-model';
import { ImportDetailsComponent } from '../../components/import-details/import-details.component';

@Component({
    selector: 'app-tree-page',
    imports: [...importSeparator(), ...importTree(), TreeNodeContainerComponent, ImportDetailsComponent],
    standalone: true,
    templateUrl: './tree-page.component.html',
    styleUrl: './tree-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePageComponent {
    imports: ImportModel = {
        name: 'Tree',
        providerImports: [
            {
                name: 'TabTreeComponent',
                from: 'tableau-ui-angular/tree',
                info: 'Component for displaying hierarchical tree structures.',
            },
            {
                name: 'TabTreeNodeComponent',
                from: 'tableau-ui-angular/tree',
                info: 'Component for individual nodes within a tree.',
            },
            {
                name: 'ExpandedContentDirective',
                from: 'tableau-ui-angular/tree',
                info: 'Directive for content displayed when a tree node is expanded.',
            },
            {
                name: 'CollapsedContentDirective',
                from: 'tableau-ui-angular/tree',
                info: 'Directive for content displayed when a tree node is collapsed.',
            },
        ],
        providerImportFunctions: [
            {
                name: 'importTree',
                from: 'tableau-ui-angular/tree/imports',
                info: 'Imports the Tree component and its related directives.',
            },
        ],
    };
}
