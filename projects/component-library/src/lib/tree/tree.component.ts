import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    DoCheck,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    OnDestroy,
    OnInit,
    TemplateRef,
    viewChild,
    viewChildren,
} from '@angular/core';
import { TabTreeNodeComponent } from './tree-node.component';
import { debounceTime, Subject } from 'rxjs';
import { TreeNodeRegistry } from './tree-node-registry';
@Component({
    selector: 'tab-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TabTreeComponent implements AfterContentInit, OnDestroy {
    selfElementRef = inject(ElementRef<HTMLElement>);
    showRootGridLines = input<boolean>(false);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    gridLinesBorder: InputSignal<string | undefined> = input<
        string | undefined
    >(undefined);
    gridLinesBorderRadius = input<string>('0px');
    expandButtonSize = input<string>('1.2rem');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandButtonColor: InputSignal<string | undefined> = input<
        string | undefined
    >(undefined);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandButtonGap: InputSignal<string | undefined> = input<
        string | undefined
    >('0.2rem');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    expandButtonTooltip: InputSignal<
        | {
              expand: TemplateRef<any> | string | undefined;
              collapse: TemplateRef<any> | string | undefined;
              position: 'top' | 'bottom' | 'left' | 'right';
              margin?: string;
              context?: any | undefined;
          }
        | undefined
    > = input<
        | {
              expand: TemplateRef<any> | string | undefined;
              collapse: TemplateRef<any> | string | undefined;
              position: 'top' | 'bottom' | 'left' | 'right';
              margin?: string;
              context?: any | undefined;
          }
        | undefined
    >(undefined);
    expandButtonAlign = input<string>('center');
    childrenIndent = input<string>('1.4rem');
    keepButtonOffsetOnNoChildren = input<boolean>(true);

    hierarchyMode = input<'auto' | 'manual'>('auto');

    registry = new TreeNodeRegistry();

    // used when hierarchyMode is auto to get direct children
    // directChildren = contentChildren(TabTreeNodeComponent);
    templateParams = {
        childrenIndent: this.childrenIndent,
        expandButtonSize: this.expandButtonSize,
        expandButtonColor: this.expandButtonColor,
        expandButtonGap: this.expandButtonGap,
        expandButtonTooltip: this.expandButtonTooltip,
        expandButtonAlign: this.expandButtonAlign,
        keepButtonOffsetOnNoChildren: this.keepButtonOffsetOnNoChildren,
    };

    constructor() {
        effect(() => {
            // set the hierarchyMode of each children all times
            const registryNodes = this.registry.nodes();
            
            for (const child of registryNodes.filter(
                (e) => e.hierarchyParentId() === undefined
            )) {
                if (this.hierarchyMode() === 'auto') {
                    this.hierarchyModeAutoSetChildrenDepthAndId(
                        registryNodes,
                        child,
                        null,
                        this.showRootGridLines() ? 1 : 0
                    );
                } else {
                    this.hierarchyModeManualSetChildrenDepthAndId(
                        child,
                        this.showRootGridLines() ? 1 : 0
                    );
                }
            }
            if (this.gridLinesBorder()) {
                this.redrawGridLines();
            }
        });
    }

    hierarchyModeAutoSetChildrenDepthAndId(
        allNodes: TabTreeNodeComponent[],
        node: TabTreeNodeComponent,
        parentNode: TabTreeNodeComponent | null = null,
        depth: number
    ) {
        node.depth.set(depth);
        node.parent.set(parentNode);
        node.children.set(
            allNodes.filter((e) => e.hierarchyParentId() === node.hierarchyId())
        );
        for (const c of node.children()) {
            this.hierarchyModeAutoSetChildrenDepthAndId(allNodes, c, node, depth + 1);
        }
    }

    hierarchyModeManualSetChildrenDepthAndId(
        child: TabTreeNodeComponent,
        currentChildDepth: number
    ) {
        if (child.hierarchyId() === undefined) {
            console.error(
                'In TabTreeComponent, a node is defined without hierarcyId. hierarcyId is required for all nodes'
            );
            return;
        }
        child.depth.set(currentChildDepth);
        // get direct children
        const children = this.registry
            .nodes()
            .filter((e) => e.hierarchyParentId() === child.hierarchyId());
        child.children.set(children);
        for (const c of children) {
            c.parent.set(child);
            this.hierarchyModeManualSetChildrenDepthAndId(
                c,
                currentChildDepth + 1
            );
        }
    }

    childrenDisplayOrder = computed(() => {
        const rootChildren = this.registry
            .nodes()
            .filter((e) => e.parent() === null)
            .sort((a, b) =>
                a.order() > b.order() ? 1 : a.order() < b.order() ? -1 : 0
            );
        const ret: TabTreeNodeComponent[] = [];
        for (const child of rootChildren) {
            ret.push(...this.getChildrenDisplayOrder(child));
        }
        return ret;
    });
    getChildrenDisplayOrder(node: TabTreeNodeComponent) {
        const ret: TabTreeNodeComponent[] = [node];
        const sortedChildren = node
            .children()
            .sort((a, b) =>
                a.order() > b.order() ? 1 : a.order() < b.order() ? -1 : 0
            );
        for (const child of sortedChildren) {
            ret.push(...this.getChildrenDisplayOrder(child));
        }

        return ret;
    }

    shouldShowNode(child: TabTreeNodeComponent) {
        let p: TabTreeNodeComponent | null = child.parent();
        while (p) {
            if (!p.expanded()) {
                return false;
            }
            p = p.parent();
        }
        return true;
    }
    private resizeObserver!: ResizeObserver;
    ngAfterContentInit(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.redrawGridLines();
        });
        this.resizeObserver.observe(this.selfElementRef.nativeElement);
    }
    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    existingGridLines: {
        id: string;
        element: HTMLDivElement;
    }[] = [];

    private redrawCounter = 0;
    redrawGridLines() {
        if (this.gridLinesBorder() === undefined) {
            return;
        }

        const currentRedrawCounter = this.redrawCounter + 1;
        this.redrawCounter = currentRedrawCounter;
        const gridLines: {
            id: string;
            from: { top: number; left: number };
            to: { top: number; left: number };
        }[] = [];
        for (const child of this.registry.nodes()) {
            if (this.redrawCounter !== currentRedrawCounter) {
                return;
            }
            // root gridlines
            if (this.showRootGridLines() && !child.parent()) {
                const selfRect =
                    this.selfElementRef.nativeElement.getBoundingClientRect();
                const buttonRect = child
                    .headerButton()
                    ?.nativeElement?.nativeElement?.getBoundingClientRect();
                if (!selfRect || !buttonRect) {
                    continue;
                }
                if (this.redrawCounter !== currentRedrawCounter) {
                    return;
                }
                gridLines.push({
                    id: child.hierarchyId(),
                    from: {
                        top: 0,
                        left: 0,
                    },
                    to: {
                        top:
                            buttonRect.top -
                            selfRect.top +
                            buttonRect.height / 2,
                        left:
                            buttonRect.x -
                            selfRect.x +
                            (child.children().length === 0
                                ? buttonRect.width
                                : 0),
                    },
                });
                continue;
            }
            if (this.redrawCounter !== currentRedrawCounter) {
                return;
            }
            // show children gridlines
            if (
                child.depth() === 0 ||
                !child.parent() ||
                !child.parent()!.expanded() ||
                child.parent()!.headerButton() === undefined
            ) {
                continue;
            }

            const selfRect =
                this.selfElementRef.nativeElement.getBoundingClientRect();
            const parentButtonRect = child
                .parent()!
                .headerButton()
                ?.nativeElement?.nativeElement?.getBoundingClientRect();
            const buttonRect = child
                .headerButton()
                ?.nativeElement?.nativeElement?.getBoundingClientRect();

            if (!selfRect || !parentButtonRect || !buttonRect) {
                continue;
            }
            if (this.redrawCounter !== currentRedrawCounter) {
                return;
            }

            gridLines.push({
                id: child.hierarchyId(),
                from: {
                    top:
                        parentButtonRect.top -
                        selfRect.top +
                        parentButtonRect.height,
                    left:
                        parentButtonRect.x -
                        selfRect.left +
                        parentButtonRect.width / 2,
                },
                to: {
                    top: buttonRect.top - selfRect.top + buttonRect.height / 2,
                    left:
                        buttonRect.x -
                        selfRect.x +
                        (child.children().length === 0 ? buttonRect.width : 0),
                },
            });
        }
        // get the gridlines that we do not need
        const gridLinesToRemove = this.existingGridLines.filter(
            (line) => !gridLines.find((l) => l.id === line.id)
        );
        if (this.redrawCounter !== currentRedrawCounter) {
            return;
        }
        for (const line of gridLinesToRemove) {
            line.element.remove();
        }
        if (this.redrawCounter !== currentRedrawCounter) {
            return;
        }
        // remove the gridlines from the existingGridLines array
        this.existingGridLines = this.existingGridLines.filter(
            (line) => !gridLinesToRemove.find((l) => l.id === line.id)
        );
        // add the new gridlines to the existingGridLines array
        for (const line of gridLines) {
            if (this.redrawCounter !== currentRedrawCounter) {
                return;
            }
            let l = this.existingGridLines.find((l) => l.id === line.id);
            if (!l) {
                l = {
                    id: line.id,
                    element: document.createElement('div'),
                };
                l.element.className = 'grid-line';
                l.element.style.position = 'absolute';
                this.selfElementRef.nativeElement.appendChild(l.element);
                this.existingGridLines.push(l);
            }
            l.element.style.top = `${line.from.top}px`;
            l.element.style.left = `${line.from.left}px`;
            l.element.style.width = `${line.to.left - line.from.left}px`;
            l.element.style.height = `${line.to.top - line.from.top}px`;
            l.element.style.pointerEvents = 'none';
            l.element.style.borderBottom = this.gridLinesBorder()!;
            // only draw the left border if its the last child of the parent
            l.element.style.borderLeft = this.gridLinesBorder()!;

            l.element.style.borderBottomLeftRadius =
                this.gridLinesBorderRadius();
        }
    }
}
