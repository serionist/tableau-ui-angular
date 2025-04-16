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

    expandButtonColor = input<string | undefined>(undefined);


    hierarchyModeAutoChildren = contentChildren(TabTreeNodeComponent);

    template = viewChild<TemplateRef<any>>('treeNodeTemplate');

   

    headerButton =
        viewChild<ElementRef<ElementRef<HTMLElement>>>('headerButton');
    // used when hierarchyMode is auto to get direct parent
    hierarchyModeAutoParent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    hierarchyMode = signal<'auto' | 'manual'>('auto');
    hierarchyId = input<string | undefined>('');
    hierarchyParentId = input<string | undefined>(undefined);

    children = signal<TabTreeNodeComponent[]>([]);
    parent = signal<TabTreeNodeComponent | null>(null);

    depth = signal<number>(-1);
    id = signal<string>('');

    order = input<number>(0);
    constructor() {
        effect(() => {
            // if hierarchMode is auto, set the depth and id of each direct children automatically
            if (this.hierarchyMode() === 'auto') {
                this.parent.set(this.hierarchyModeAutoParent)
                this.children.set([...this.hierarchyModeAutoChildren()]);
                for (const [index, child] of this.children().entries()) {
                    child.depth.set(this.depth() + 1);
                    child.id.set(`${this.id()}-${index}`);
                }
            }
        });
    }

    ngAfterContentInit(): void {}

    ngOnInit(): void {}

    setExpanded(expanded: boolean) {
        this.expanded.set(expanded);
        this.expandedChange.emit(expanded);
    }
}
