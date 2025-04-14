import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    contentChildren,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    OnInit,
    output,
    signal,
    TemplateRef,
    viewChild,
} from '@angular/core';
import { CollapsedContentDirective } from './collapsed-content.directive';
import { ExpandedContentDirective } from './expanded-content.directive';

@Component({
    selector: 'tab-tree-node',
    templateUrl: './tree-node.component.html',
    styleUrls: ['./tree-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TabTreeNodeComponent implements AfterContentInit {
    initialExpanded = input<boolean>(false);
    expanded = linkedSignal<boolean>(() => this.initialExpanded());
    expandedChange = output<boolean>();

    collapsedContent = contentChild(CollapsedContentDirective);
    expandedContent = contentChild(ExpandedContentDirective);

    children = contentChildren(TabTreeNodeComponent);
    template = viewChild<TemplateRef<any>>('treeNodeTemplate');

    headerButton = viewChild<ElementRef<ElementRef<HTMLElement>>>('headerButton');
    parent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    depth = signal<number>(-1);
    id = signal<string>('');
    constructor() {
        effect(() => {
            for (const [index, child] of this.children().entries()) {
                child.depth.set(this.depth() + 1);
                child.id.set(`${this.id()}-${index}`);
            }
        });
    }

    ngAfterContentInit(): void {}

    ngOnInit(): void {
      //  console.log('Tree node component initialized', this.parent);
    }

    setExpanded(expanded: boolean) {
        this.expanded.set(expanded);
        this.expandedChange.emit(expanded);
    }
}
