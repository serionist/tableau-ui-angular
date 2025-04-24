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
    InputSignal,
    linkedSignal,
    OnInit,
    output,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    WritableSignal,
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

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    collapsedContent: Signal<CollapsedContentDirective | undefined> = contentChild(CollapsedContentDirective);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandedContent: Signal<ExpandedContentDirective | undefined> = contentChild(ExpandedContentDirective);

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandButtonColor: InputSignal<string | undefined> = input<string | undefined>(undefined);


    hierarchyModeAutoChildren = contentChildren(TabTreeNodeComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    template: Signal<TemplateRef<any> | undefined> = viewChild<TemplateRef<any>>('treeNodeTemplate');

   
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    headerButton: Signal<ElementRef<ElementRef<HTMLElement>> | undefined> =
        viewChild<ElementRef<ElementRef<HTMLElement>>>('headerButton');
    // used when hierarchyMode is auto to get direct parent
    hierarchyModeAutoParent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    hierarchyMode = signal<'auto' | 'manual'>('auto');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hierarchyId: InputSignal<string | undefined> = input<string | undefined>('');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hierarchyParentId: InputSignal<string | undefined> = input<string | undefined>(undefined);

    children = signal<TabTreeNodeComponent[]>([]);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    parent: WritableSignal<TabTreeNodeComponent | null> = signal<TabTreeNodeComponent | null>(null);

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
