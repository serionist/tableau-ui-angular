import { Component, input } from '@angular/core';
import { TreeNodeRegistry } from 'component-library';

@Component({
    selector: 'tree-node-container',
    template: `<tab-tree-node [registry]="registry()">
        Top Node
        <tab-tree-node [registry]="registry()">
            Subnode 1
            <tab-tree-node [registry]="registry()"> Subsubnode 1 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 2 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
        <tab-tree-node [registry]="registry()">
            Subnode 2
            <tab-tree-node [registry]="registry()"> Subsubnode 1 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 2 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
        <tab-tree-node [registry]="registry()">
            Subnode 3
            <tab-tree-node [registry]="registry()"> Subsubnode 1 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 2 </tab-tree-node>
            <tab-tree-node [registry]="registry()"> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
    </tab-tree-node>`,
    standalone: false,
})
export class TreeNodeContainerComponent {
    registry = input.required<TreeNodeRegistry>();
}
