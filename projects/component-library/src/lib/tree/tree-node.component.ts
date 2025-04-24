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
import { generateRandomString } from '../utils';
import { TreeNodeRegistry } from './tree-node-registry';

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
    // used when hierarchyMode is auto to get direct parent
    hierarchyModeAutoParent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hierarchyId: InputSignal<string | undefined> = input<string | undefined>(
        ''
    );
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hierarchyParentId: InputSignal<string | undefined> = input<
        string | undefined
    >(undefined);

    children = signal<TabTreeNodeComponent[]>([]);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    parent: WritableSignal<TabTreeNodeComponent | null> =
        signal<TabTreeNodeComponent | null>(null);

    depth = signal<number>(-1);
    readonly id = generateRandomString(16);

    order = input<number>(0);
    // The registry of the tree node. It is optional. If provided, the node will register itself and will be detected by the tree even if it's located in a sub-component
    registry = input<TreeNodeRegistry>();
   

    ngAfterContentInit(): void {}

    ngOnInit(): void {
        this.registry()?.register(this);
    }

    setExpanded(expanded: boolean) {
        this.expanded.set(expanded);
        this.expandedChange.emit(expanded);
    }
}
