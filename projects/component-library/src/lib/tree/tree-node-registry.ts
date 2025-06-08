import { signal } from '@angular/core';
import type { TabTreeNodeComponent } from './tree-node.component';

export class TreeNodeRegistry {
    readonly nodes = signal<TabTreeNodeComponent[]>([]);

    register(node: TabTreeNodeComponent) {
        const nodes = this.nodes();
        const existingNode = nodes.find((n) => n.$hierarchyId() === node.$hierarchyId());
        if (!existingNode) {
            this.nodes.set([...nodes, node]);
        }
    }
    unregister(node: TabTreeNodeComponent) {
        const nodes = this.nodes();
        const filteredNodes = nodes.filter((n) => n.$hierarchyId() !== node.$hierarchyId());
        if (filteredNodes.length !== nodes.length) {
            this.nodes.set(filteredNodes);
        }
    }
}
