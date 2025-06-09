import { TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective } from 'tableau-ui-angular/tree';

export function importTree() {
    return [TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective];
}
