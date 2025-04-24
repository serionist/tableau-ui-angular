import { signal } from "@angular/core";
import { TabTreeNodeComponent } from "./tree-node.component";

export class TreeNodeRegistry {
    readonly nodes = signal<TabTreeNodeComponent[]>([]);

    register(node: TabTreeNodeComponent) {
        this.nodes.set([...this.nodes(), node]);
    }
}