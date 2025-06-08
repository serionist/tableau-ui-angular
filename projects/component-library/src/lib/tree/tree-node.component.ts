import type { InputSignal, OnDestroy, OnInit, Signal, TemplateRef, WritableSignal } from '@angular/core';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    linkedSignal,
    model,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { CollapsedContentDirective } from './collapsed-content.directive';
import { ExpandedContentDirective } from './expanded-content.directive';
import { generateRandomString } from '../utils';
import type { TreeNodeRegistry } from './tree-node-registry';
import type { ExpandButtonTooltipParams } from './tree.component';
import { TabTreeComponent } from './tree.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { TreeNodeInterface } from './tree-node-interface';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'tab-tree-node',
    standalone: false,
    templateUrl: './tree-node.component.html',
    styleUrl: './tree-node.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TabTreeNodeComponent),
            multi: true,
        },
    ],
})
export class TabTreeNodeComponent implements OnInit, OnDestroy, TreeNodeInterface {
    readonly headerButtonId = generateRandomString(16);
    // used when hierarchyMode is auto to get direct parent
    private readonly hierarchyModeAutoParent = inject(TabTreeNodeComponent, {
        skipSelf: true,
        optional: true,
    });

    private readonly tabTree = inject(TabTreeComponent, {
        skipSelf: true,
        optional: true,
    });

    readonly $expanded = model<boolean>(false, {
        alias: 'expanded',
    });
    readonly expanded$ = toObservable(this.$expanded);
    readonly expandedChange = output<boolean>();

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $collapsedContent: Signal<CollapsedContentDirective | undefined> = contentChild(CollapsedContentDirective);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $expandedContent: Signal<ExpandedContentDirective | undefined> = contentChild(ExpandedContentDirective);

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $expandButtonColor: InputSignal<string | undefined> = input<string | undefined>(undefined, {
        alias: 'expandButtonColor',
    });

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $template: Signal<TemplateRef<TreeNodeTemplate> | undefined> = viewChild<TemplateRef<TreeNodeTemplate>>('treeNodeTemplate');

    readonly $hierarchyId: InputSignal<string> = input<string>(generateRandomString(16), {
        alias: 'hierarchyId',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $hierarchyParentId: InputSignal<string | undefined> = input<string | undefined>(this.hierarchyModeAutoParent?.$hierarchyId(), {
        alias: 'hierarchyParentId',
    });

    readonly $children = signal<TabTreeNodeComponent[]>([]);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $parent: WritableSignal<TabTreeNodeComponent | null> = signal<TabTreeNodeComponent | null>(null);

    readonly $allParentsExpanded = computed(() => {
        const parents: TabTreeNodeComponent[] = [];
        let parent: TabTreeNodeComponent | null = this.$parent();
        while (parent) {
            parents.push(parent);
            parent = parent.$parent();
        }
        return parents.every((p) => p.$expanded());
    });

    readonly $depth = signal<number>(-1);

    readonly $order = input<number>(0, {
        alias: 'order',
    });
    // The registry of the tree node. It is optional. If provided, the node will register itself and will be detected by the tree even if it's located in a sub-component
    readonly $registry = input<TreeNodeRegistry>(undefined, {
        alias: 'registry',
    });

    ngOnInit(): void {
        const registry = this.$registry() ?? this.tabTree?.registry;
        if (!registry) {
            throw new Error('TreeNodeComponent: registry is not provided. Please provide a registry or use the TabTreeComponent.');
        }
        registry.register(this);
    }

    ngOnDestroy(): void {
        const registry = this.$registry() ?? this.tabTree?.registry;
        if (!registry) {
            console.warn('TreeNodeComponent: registry is not provided. Please provide a registry or use the TabTreeComponent.');
        }
        registry?.unregister(this);
    }

    setExpanded(expanded: boolean) {
        this.$expanded.set(expanded);
        this.expandedChange.emit(expanded);
    }
}
export interface TreeNodeTemplate {
    $childrenIndent: Signal<string>;
    $expandButtonSize: Signal<string>;
    $expandButtonColor: Signal<string | undefined>;
    $expandButtonGap: Signal<string | undefined>;
    $expandButtonTooltip: Signal<ExpandButtonTooltipParams | undefined>;
    $expandButtonAlign: Signal<string>;
    $keepButtonOffsetOnNoChildren: Signal<boolean>;
}
