import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TreeNodeRegistry } from 'component-library';

@Component({
    selector: 'app-tree-node-container',
    standalone: false,
    template: `
        <tab-tree-node>
            Top Node
            <tab-tree-node>
                Subnode 1
                <tab-tree-node>Subsubnode 1</tab-tree-node>
                <tab-tree-node>Subsubnode 2</tab-tree-node>
                <tab-tree-node>Subsubnode 3</tab-tree-node>
            </tab-tree-node>
            <tab-tree-node>
                Subnode 2
                <tab-tree-node>Subsubnode 1</tab-tree-node>
                <tab-tree-node>Subsubnode 2</tab-tree-node>
                <tab-tree-node>Subsubnode 3</tab-tree-node>
            </tab-tree-node>
            <tab-tree-node>
                Subnode 3
                <tab-tree-node>Subsubnode 1</tab-tree-node>
                <tab-tree-node>Subsubnode 2</tab-tree-node>
                <tab-tree-node>Subsubnode 3</tab-tree-node>
            </tab-tree-node>
        </tab-tree-node>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeContainerComponent {}
