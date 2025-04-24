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
    OnDestroy,
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
import { generateRandomString } from '../utils';
import { TreeNodeRegistry } from './tree-node-registry';
import { TabTreeComponent } from './tree.component';

@Component({
    selector: 'tab-tree-node',
    templateUrl: './tree-node.component.html',
    styleUrls: ['./tree-node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TabTreeNodeComponent implements OnInit, OnDestroy {
    

     // used when hierarchyMode is auto to get direct parent
     private hierarchyModeAutoParent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    private tabTree = inject(TabTreeComponent, {
        skipSelf: true,
        optional: true,
    });
    

    initialExpanded = input<boolean>(false);
    expanded = linkedSignal<boolean>(() => this.initialExpanded());
    expandedChange = output<boolean>();

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    collapsedContent: Signal<CollapsedContentDirective | undefined> =
        contentChild(CollapsedContentDirective);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandedContent: Signal<ExpandedContentDirective | undefined> =
        contentChild(ExpandedContentDirective);

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandButtonColor: InputSignal<string | undefined> = input<
        string | undefined
    >(undefined);

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    template: Signal<TemplateRef<any> | undefined> =
        viewChild<TemplateRef<any>>('treeNodeTemplate');

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    headerButton: Signal<ElementRef<ElementRef<HTMLElement>> | undefined> =
        viewChild<ElementRef<ElementRef<HTMLElement>>>('headerButton');
   

    hierarchyId: InputSignal<string> = input<string>(
        generateRandomString(16)
    );
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hierarchyParentId: InputSignal<string | undefined> = input<
        string | undefined
    >(this.hierarchyModeAutoParent?.hierarchyId());

    children = signal<TabTreeNodeComponent[]>([]);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    parent: WritableSignal<TabTreeNodeComponent | null> =
        signal<TabTreeNodeComponent | null>(null);

    depth = signal<number>(-1);

    order = input<number>(0);
    // The registry of the tree node. It is optional. If provided, the node will register itself and will be detected by the tree even if it's located in a sub-component
    registry = input<TreeNodeRegistry>();

    ngAfterContentInit(): void {}

    ngOnInit(): void {
        const registry = this.registry() ?? this.tabTree?.registry;
        if (!registry) {
            throw new Error(
                'TreeNodeComponent: registry is not provided. Please provide a registry or use the TabTreeComponent.'
            );
        }
        registry.register(this);
    }

    ngOnDestroy(): void {
        const registry = this.registry() ?? this.tabTree?.registry;
        if (!registry) {
            console.warn(
                'TreeNodeComponent: registry is not provided. Please provide a registry or use the TabTreeComponent.'
            );
        }
        registry?.unregister(this);
    }

    setExpanded(expanded: boolean) {
        this.expanded.set(expanded);
        this.expandedChange.emit(expanded);
    }
}
