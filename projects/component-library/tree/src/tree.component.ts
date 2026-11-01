import { isPlatformBrowser } from '@angular/common';
import type { InputSignal, OnDestroy, TemplateRef } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, effect, ElementRef, inject, Injector, input, linkedSignal, PLATFORM_ID, untracked } from '@angular/core';
import type { TabTreeNodeComponent, TreeNodeTemplate } from './tree-node.component';
import { enclosingNode } from './tree-node-nesting';
import { TreeNodeRegistry } from './tree-node-registry';
/**
 * A tree of `tab-tree-node` elements, which follows the WAI-ARIA tree view pattern. The host is a `tree`, which the app
 * names with `aria-label` or `aria-labelledby` on it; each shown node's row is a `treeitem` with its level, its place
 * among its siblings and, when it has children, whether it is open.
 *
 * The tree is one Tab stop: the first node, then the node the user last moved to. On a node, Down and Up move to the
 * next and previous shown node; Right opens a closed node and moves into an open one; Left closes an open node and
 * moves from a child to its parent; Home and End move to the first and last shown node; Enter opens or closes a node;
 * a character moves to the next shown node whose text starts with it. A control in a node's content keeps its own Tab
 * stop and its own keys. The buttons that open and close the nodes are for the pointer: they take no focus, and are
 * hidden from assistive technology, since the node says whether it is open. An assistive technology that activates a
 * node clicks its row, which opens or closes it as the button does; a click on the node's content only focuses it.
 */
@Component({
  selector: 'tab-tree',
  standalone: false,
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tree',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusin($event)',
    '(click)': 'onClick($event)',
  },
})
export class TabTreeComponent implements OnDestroy {
  private readonly selfElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // The grid lines are drawn from measuring the nodes, which only the browser can, once the tree is drawn
  private rendered = false;
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

  /**
   * Where a node's parent comes from. `auto`, the default: the node its `hierarchyParentId` names, or else the node it
   * sits in. `manual`: only the node its `hierarchyParentId` names, so a node that names none is at the top level,
   * wherever it sits.
   * @default 'auto'
   */
  readonly $hierarchyMode = input<'auto' | 'manual'>('auto', {
    alias: 'hierarchyMode',
  });

  readonly registry = new TreeNodeRegistry();

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
      // place every node under its parent, as the mode says, from the top level down
      const registryNodes = this.registry.nodes();
      const auto = this.$hierarchyMode() === 'auto';

      for (const child of registryNodes.filter(e => (auto ? autoParentId(e) : e.$hierarchyParentId()) === undefined)) {
        if (auto) {
          this.hierarchyModeAutoSetChildrenDepthAndId(registryNodes, child, null, this.$showRootGridLines() ? 1 : 0);
        } else {
          // a node the auto mode put under another is at the top level now
          child.$parent.set(null);
          this.hierarchyModeManualSetChildrenDepthAndId(child, this.$showRootGridLines() ? 1 : 0);
        }
      }
      if (this.$gridLinesBorder() !== undefined && this.rendered) {
        this.redrawGridLines();
      }
    });
    // the observer's first call draws them
    afterNextRender(() => {
      this.rendered = true;
      this.resizeObserver = new ResizeObserver(() => {
        this.redrawGridLines();
      });
      this.resizeObserver.observe(this.selfElementRef.nativeElement);
    });
    // Focus that a render drops from a row to the body, as when a closing node hides the row, its node goes or the
    // template moves it, moves to the node that takes the Tab stop; focus the app has moved elsewhere by then stays. This
    // runs before the tree's template changes the rows, while the focus is still in one: a browser removing the focused
    // element fires no focusout in every engine.
    effect(() => {
      this.$shownNodes();
      const tabStop = this.$tabStop();
      if (!this.isBrowser || !tabStop) {
        return;
      }
      untracked(() => {
        if (!this.rowOf(this.document.activeElement)) {
          return;
        }
        afterNextRender(
          () => {
            const active = this.document.activeElement;
            if (active === null || active === this.document.body) {
              this.rowOfNode(tabStop)?.focus();
            }
          },
          { injector: this.injector },
        );
      });
    });
  }

  // A node's children are the nodes that name it as their parent, and those that sit in it and name none
  hierarchyModeAutoSetChildrenDepthAndId(allNodes: TabTreeNodeComponent[], node: TabTreeNodeComponent, parentNode: TabTreeNodeComponent | null = null, depth: number) {
    node.$depth.set(depth);
    node.$parent.set(parentNode);
    node.$children.set(allNodes.filter(e => autoParentId(e) === node.$hierarchyId()));
    for (const c of node.$children()) {
      this.hierarchyModeAutoSetChildrenDepthAndId(allNodes, c, node, depth + 1);
    }
  }

  // A node's children are the nodes that name it as their parent; where they sit doesn't matter
  hierarchyModeManualSetChildrenDepthAndId(child: TabTreeNodeComponent, currentChildDepth: number) {
    child.$depth.set(currentChildDepth);
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

  // The nodes the tree shows, in the order of their rows: those at the top level, and those whose parents are all open
  private readonly $shownNodes = computed(() => this.$childrenDisplayOrder().filter(node => !node.$parent() || node.$allParentsExpanded()));

  // The node the user last moved to. When a closing node hides it, the nearest shown node above it, the one that closed;
  // when it goes, the shown node before it; without one, the tree's first node takes the Tab stop.
  private readonly $current = linkedSignal<TabTreeNodeComponent[], TabTreeNodeComponent | undefined>({
    source: this.$shownNodes,
    computation: (shown, previous) =>
      untracked(() => {
        const current = previous?.value;
        if (!previous || !current || shown.includes(current)) {
          return current;
        }
        if (this.registry.nodes().includes(current)) {
          let ancestor = current.$parent();
          while (ancestor && !shown.includes(ancestor)) {
            ancestor = ancestor.$parent();
          }
          return ancestor ?? undefined;
        }
        const at = previous.source.indexOf(current);
        return previous.source
          .slice(0, Math.max(at, 0))
          .reverse()
          .find(node => shown.includes(node));
      }),
  });

  // The tree's one Tab stop
  private readonly $tabStop = computed(() => this.$current() ?? this.$shownNodes().at(0));

  // The Tab stop's headerButtonId, which its row compares with its own
  private readonly $tabStopId = computed(() => this.$tabStop()?.headerButtonId);

  // Each shown node's level, from 1 at the top, and its place among its siblings, by its headerButtonId
  private readonly $treeItems = computed(() => {
    // each parent's shown children, the top level's under null; a shown node's parent is shown, and comes before it
    const groups = new Map<TabTreeNodeComponent | null, { level: number; size: number }>();
    const places = this.$shownNodes().map(node => {
      const parent = node.$parent();
      let group = groups.get(parent);
      if (!group) {
        group = { level: parent ? (groups.get(parent.$parent())?.level ?? 0) + 1 : 1, size: 0 };
        groups.set(parent, group);
      }
      group.size++;
      return { node, group, posInSet: group.size };
    });
    return new Map(places.map(({ node, group, posInSet }) => [node.headerButtonId, { level: group.level, setSize: group.size, posInSet }]));
  });

  // What each node's row reads: the template params, its place in the tree, and whether it is the Tab stop
  protected readonly nodeContext = {
    ...this.templateParams,
    $treeItem: (headerButtonId: string) => this.$treeItems().get(headerButtonId),
    $tabStopId: this.$tabStopId,
  };

  // The tree's rows: one per shown node, each a child of the host, in the order of $shownNodes
  private rows() {
    return Array.from(this.selfElementRef.nativeElement.querySelectorAll<HTMLElement>(':scope > [role="treeitem"]'));
  }

  // The row that holds `target`: the row itself, or a control in its node's content
  private rowOf(target: Node | null) {
    return this.rows().find(row => row.contains(target));
  }

  // A row's node, whose headerButtonId its button has
  private nodeOf(row: HTMLElement) {
    const id = row.querySelector(':scope > .header-button')?.id;
    return this.registry.nodes().find(node => node.headerButtonId === id);
  }

  // A node's row: its button's parent, when that is a row of this tree
  private rowOfNode(node: TabTreeNodeComponent) {
    const row = this.document.getElementById(node.headerButtonId)?.parentElement;
    return row?.parentElement === this.selfElementRef.nativeElement ? row : undefined;
  }

  // Focus in a row, or in a control in it, makes its node the Tab stop
  protected onFocusin(event: FocusEvent) {
    const row = this.rowOf(event.target instanceof Node ? event.target : null);
    const node = row && this.nodeOf(row);
    if (node) {
      this.$current.set(node);
    }
  }

  // A click on the row itself, where an assistive technology's activation lands, opens or closes a node with children,
  // as its hidden button does for the pointer, and moves the focus to it. A click on the node's content is the content's.
  protected onClick(event: MouseEvent) {
    const row = this.rowOf(event.target instanceof Node ? event.target : null);
    const node = row && this.nodeOf(row);
    if (!node || event.target !== row) {
      return;
    }
    // a drag that selects the node's text and ends on the row is no activation
    const selection = this.document.getSelection();
    if (selection && !selection.isCollapsed && (row.contains(selection.anchorNode) || row.contains(selection.focusNode))) {
      return;
    }
    if (node.$children().length > 0) {
      node.setExpanded(!node.$expanded());
    }
    row.focus();
  }

  // The tree view pattern's keys, on a row; keys from a control in a node's content are the control's
  protected onKeydown(event: KeyboardEvent) {
    const row = this.rowOf(event.target instanceof Node ? event.target : null);
    const node = row && this.nodeOf(row);
    if (!node || event.target !== row || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const shown = this.$shownNodes();
    const at = shown.indexOf(node);
    const hasChildren = node.$children().length > 0;
    let next: TabTreeNodeComponent | null | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = shown.at(at + 1);
        break;
      case 'ArrowUp':
        next = at > 0 ? shown[at - 1] : undefined;
        break;
      case 'Home':
        next = shown.at(0);
        break;
      case 'End':
        next = shown.at(-1);
        break;
      case 'ArrowRight':
        if (hasChildren && !node.$expanded()) {
          node.setExpanded(true);
        } else if (hasChildren) {
          next = shown.at(at + 1);
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && node.$expanded()) {
          node.setExpanded(false);
        } else {
          next = node.$parent();
        }
        break;
      case 'Enter':
        if (!hasChildren) {
          return;
        }
        node.setExpanded(!node.$expanded());
        break;
      default: {
        const match = this.typeAhead(event.key, row);
        if (!match) {
          return;
        }
        event.preventDefault();
        match.focus();
        return;
      }
    }
    event.preventDefault();
    if (next) {
      this.rowOfNode(next)?.focus();
    }
  }

  // The next row after `row`, wrapping, whose node's text starts with the character typed
  private typeAhead(key: string, row: HTMLElement) {
    if (key.length !== 1 || key.trim() === '') {
      return undefined;
    }
    const typed = key.toLocaleLowerCase();
    const rows = this.rows();
    const at = rows.indexOf(row);
    for (let step = 1; step <= rows.length; step++) {
      const candidate = rows[(at + step) % rows.length];
      const text = candidate.querySelector(':scope > .header-content')?.textContent.trim().toLocaleLowerCase() ?? '';
      if (text.startsWith(typed)) {
        return candidate;
      }
    }
    return undefined;
  }

  private resizeObserver: ResizeObserver | undefined;
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

      const headerButtonRect = this.document.getElementById(child.headerButtonId)?.getBoundingClientRect();
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
      const parentButtonRect = this.document.getElementById(child.$parent()!.headerButtonId)?.getBoundingClientRect();

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
          element: this.document.createElement('div'),
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
// The id of a node's parent in auto mode: the one it names, or else the node it sits in. Read when the tree places its
// nodes, so a parent whose hierarchyId is bound, and set after its children were made, is found too.
function autoParentId(node: TabTreeNodeComponent): string | undefined {
  return node.$hierarchyParentId() ?? enclosingNode(node)?.$hierarchyId();
}

export interface ExpandButtonTooltipParams<T = unknown> {
  expand: TemplateRef<T> | string | undefined;
  collapse: TemplateRef<T> | string | undefined;
  position: 'bottom' | 'left' | 'right' | 'top';
  margin?: string;
  context?: T | undefined;
}
