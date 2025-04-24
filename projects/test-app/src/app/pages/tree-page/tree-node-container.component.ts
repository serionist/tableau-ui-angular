import { Component, input } from '@angular/core';
import { TreeNodeRegistry } from 'component-library';

@Component({
    selector: 'tree-node-container',
    template: `<tab-tree-node>
        Top Node
        <tab-tree-node>
            Subnode 1
            <tab-tree-node> Subsubnode 1 </tab-tree-node>
            <tab-tree-node> Subsubnode 2 </tab-tree-node>
            <tab-tree-node> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
        <tab-tree-node>
            Subnode 2
            <tab-tree-node> Subsubnode 1 </tab-tree-node>
            <tab-tree-node> Subsubnode 2 </tab-tree-node>
            <tab-tree-node> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
        <tab-tree-node>
            Subnode 3
            <tab-tree-node> Subsubnode 1 </tab-tree-node>
            <tab-tree-node> Subsubnode 2 </tab-tree-node>
            <tab-tree-node> Subsubnode 3 </tab-tree-node>
        </tab-tree-node>
    </tab-tree-node>`,
    standalone: false,
})
export class TreeNodeContainerComponent {
}
