import { signal } from '@angular/core';
import { ExpansionPanelComponent } from './expansion-panel.component';

export class AccordionRegistry {
    readonly nodes = signal<ExpansionPanelComponent[]>([]);

    register(node: ExpansionPanelComponent) {
        const nodes = this.nodes();
        const existingNode = nodes.find((n) => n.id === node.id);
        if (!existingNode) {
            this.nodes.set([...nodes, node]);
        }
    }
    unregister(node: ExpansionPanelComponent) {
        const nodes = this.nodes();
        const filteredNodes = nodes.filter((n) => n.id === node.id);
        if (filteredNodes.length !== nodes.length) {
            this.nodes.set(filteredNodes);
        }
    }
}
