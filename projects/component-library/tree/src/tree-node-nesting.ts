import type { TabTreeNodeComponent } from './tree-node.component';

// The node each tree node sits in, which it injects, for the tree's auto mode to make its parent. Kept here, not on the
// node, whose members are public API; the public API file leaves this file out, as no public type names it.
const enclosingNodes = new WeakMap<TabTreeNodeComponent, TabTreeNodeComponent>();

/** Records the node `node` sits in, when it sits in one */
export function setEnclosingNode(node: TabTreeNodeComponent, enclosing: TabTreeNodeComponent | null) {
  if (enclosing) {
    enclosingNodes.set(node, enclosing);
  }
}

/** The node `node` sits in, if any */
export function enclosingNode(node: TabTreeNodeComponent): TabTreeNodeComponent | undefined {
  return enclosingNodes.get(node);
}
