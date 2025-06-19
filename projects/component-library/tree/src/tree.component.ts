import type { AfterContentInit, InputSignal, OnDestroy, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input } from '@angular/core';
import type { TabTreeNodeComponent, TreeNodeTemplate } from './tree-node.component';
import { TreeNodeRegistry } from './tree-node-registry';
@Component({
  selector: 'tab-tree',
  standalone: false,
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabTreeComponent implements AfterContentInit, OnDestroy {
  private readonly selfElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly $showRootGridLines = input<boolean>(false, {
    alias: 'showRootGridLines',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $gridLinesBorder: InputSignal<string | undefined> = input<string | undefined>(undefined, {
    alias: 'gridLinesBorder',
  });
  readonly $gridLinesBorderRadius = input<string>('0px', {
    alias: 'gridLinesBorderRadius',
  });
  readonly $expandButtonSize = input<string>('1.2rem', {
    alias: 'expandButtonSize',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $expandButtonColor: InputSignal<string | undefined> = input<string | undefined>(undefined, {
    alias: 'expandButtonColor',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $expandButtonGap: InputSignal<string | undefined> = input<string | undefined>('0.2rem', {
    alias: 'expandButtonGap',
  });
  // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
  readonly $expandButtonTooltip: InputSignal<ExpandButtonTooltipParams | undefined> = input<ExpandButtonTooltipParams | undefined>(undefined, {
    alias: 'expandButtonTooltip',
  });
  readonly $expandButtonAlign = input<string>('center', {
    alias: 'expandButtonAlign',
  });
  readonly $childrenIndent = input<string>('1.4rem', {
    alias: 'childrenIndent',
  });
  readonly $keepButtonOffsetOnNoChildren = input<boolean>(true, {
    alias: 'keepButtonOffsetOnNoChildren',
  });

  readonly $hierarchyMode = input<'auto' | 'manual'>('auto', {
    alias: 'hierarchyMode',
  });

  readonly registry = new TreeNodeRegistry();

  // used when hierarchyMode is auto to get direct children
  // directChildren = contentChildren(TabTreeNodeComponent);
  templateParams: TreeNodeTemplate = {
    $childrenIndent: this.$childrenIndent,
    $expandButtonSize: this.$expandButtonSize,
    $expandButtonColor: this.$expandButtonColor,
    $expandButtonGap: this.$expandButtonGap,
    $expandButtonTooltip: this.$expandButtonTooltip,
    $expandButtonAlign: this.$expandButtonAlign,
    $keepButtonOffsetOnNoChildren: this.$keepButtonOffsetOnNoChildren,
  };

  constructor() {
    effect(() => {
      // set the hierarchyMode of each children all times
      const registryNodes = this.registry.nodes();

      for (const child of registryNodes.filter(e => e.$hierarchyParentId() === undefined)) {
        if (this.$hierarchyMode() === 'auto') {
          this.hierarchyModeAutoSetChildrenDepthAndId(registryNodes, child, null, this.$showRootGridLines() ? 1 : 0);
        } else {
          this.hierarchyModeManualSetChildrenDepthAndId(child, this.$showRootGridLines() ? 1 : 0);
        }
      }
      if (this.$gridLinesBorder() !== undefined) {
        this.redrawGridLines();
      }
    });
  }

  hierarchyModeAutoSetChildrenDepthAndId(allNodes: TabTreeNodeComponent[], node: TabTreeNodeComponent, parentNode: TabTreeNodeComponent | null = null, depth: number) {
    node.$depth.set(depth);
    node.$parent.set(parentNode);
    node.$children.set(allNodes.filter(e => e.$hierarchyParentId() === node.$hierarchyId()));
    for (const c of node.$children()) {
      this.hierarchyModeAutoSetChildrenDepthAndId(allNodes, c, node, depth + 1);
    }
  }

  hierarchyModeManualSetChildrenDepthAndId(child: TabTreeNodeComponent, currentChildDepth: number) {
    child.$depth.set(currentChildDepth);
    // get direct children
    const children = this.registry.nodes().filter(e => e.$hierarchyParentId() === child.$hierarchyId());
    child.$children.set(children);
    for (const c of children) {
      c.$parent.set(child);
      this.hierarchyModeManualSetChildrenDepthAndId(c, currentChildDepth + 1);
    }
  }

  protected readonly $childrenDisplayOrder = computed(() => {
    const rootChildren = this.registry
      .nodes()
      .filter(e => e.$parent() === null)
      .sort((a, b) => (a.$order() > b.$order() ? 1 : a.$order() < b.$order() ? -1 : 0));
    const ret: TabTreeNodeComponent[] = [];
    for (const child of rootChildren) {
      ret.push(...this.getChildrenDisplayOrder(child));
    }
    return ret;
  });
  getChildrenDisplayOrder(node: TabTreeNodeComponent) {
    const ret: TabTreeNodeComponent[] = [node];
    const sortedChildren = node.$children().sort((a, b) => (a.$order() > b.$order() ? 1 : a.$order() < b.$order() ? -1 : 0));
    for (const child of sortedChildren) {
      ret.push(...this.getChildrenDisplayOrder(child));
    }

    return ret;
  }

  private resizeObserver: ResizeObserver | undefined;
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
    if (this.$gridLinesBorder() === undefined) {
      return;
    }

    // if the redrawCounter is not 0, we are already redrawing

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

      const headerButtonRect = document.getElementById(child.headerButtonId)?.getBoundingClientRect();
      // root gridlines
      if (this.$showRootGridLines() && !child.$parent()) {
        const selfRect = this.selfElementRef.nativeElement.getBoundingClientRect();
        if (!headerButtonRect) {
          continue;
        }
        if (this.redrawCounter !== currentRedrawCounter) {
          return;
        }
        gridLines.push({
          id: child.$hierarchyId(),
          from: {
            top: 0,
            left: 0,
          },
          to: {
            top: headerButtonRect.top - selfRect.top + headerButtonRect.height / 2,
            left: headerButtonRect.x - selfRect.x + (child.$children().length === 0 ? headerButtonRect.width : 0),
          },
        });
        continue;
      }
      if (this.redrawCounter !== currentRedrawCounter) {
        return;
      }

      // show children gridlines
      if (child.$depth() === 0 || !child.$parent() || !child.$parent()!.$expanded() || headerButtonRect === undefined) {
        continue;
      }

      const selfRect = this.selfElementRef.nativeElement.getBoundingClientRect();
      const parentButtonRect = document.getElementById(child.$parent()!.headerButtonId)?.getBoundingClientRect();

      if (!parentButtonRect) {
        continue;
      }
      if (this.redrawCounter !== currentRedrawCounter) {
        return;
      }
      gridLines.push({
        id: child.$hierarchyId(),
        from: {
          top: parentButtonRect.top - selfRect.top + parentButtonRect.height,
          left: parentButtonRect.x - selfRect.left + parentButtonRect.width / 2,
        },
        to: {
          top: headerButtonRect.top - selfRect.top + headerButtonRect.height / 2,
          left: headerButtonRect.x - selfRect.x + (child.$children().length === 0 ? headerButtonRect.width : 0),
        },
      });
    }
    // get the gridlines that we do not need
    const gridLinesToRemove = this.existingGridLines.filter(line => !gridLines.find(l => l.id === line.id));
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
    this.existingGridLines = this.existingGridLines.filter(line => !gridLinesToRemove.find(l => l.id === line.id));
    // add the new gridlines to the existingGridLines array
    for (const line of gridLines) {
      if (this.redrawCounter !== currentRedrawCounter) {
        return;
      }
      let l = this.existingGridLines.find(f => f.id === line.id);
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
      l.element.style.borderBottom = this.$gridLinesBorder()!;
      // only draw the left border if its the last child of the parent
      l.element.style.borderLeft = this.$gridLinesBorder()!;

      l.element.style.borderBottomLeftRadius = this.$gridLinesBorderRadius();
    }
  }
}
export interface ExpandButtonTooltipParams<T = unknown> {
  expand: TemplateRef<T> | string | undefined;
  collapse: TemplateRef<T> | string | undefined;
  position: 'bottom' | 'left' | 'right' | 'top';
  margin?: string;
  context?: T | undefined;
}
