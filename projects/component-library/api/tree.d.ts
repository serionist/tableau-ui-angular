// The public API of tableau-ui-angular/tree, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i5 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, OnDestroy, OnInit, Signal, TemplateRef, WritableSignal } from '@angular/core';
import * as i6 from 'tableau-ui-angular/button';
import * as i7 from 'tableau-ui-angular/icon';
import * as i8 from 'tableau-ui-angular/tooltip';

export declare class CollapsedContentDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<CollapsedContentDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CollapsedContentDirective, '[collapsedContent]', never, {}, {}, never, never, false, never>;
}

export interface ExpandButtonTooltipParams<T = unknown> {
  expand: TemplateRef<T> | string | undefined;
  collapse: TemplateRef<T> | string | undefined;
  position: 'bottom' | 'left' | 'right' | 'top';
  margin?: string;
  context?: T | undefined;
}

export declare class ExpandedContentDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<ExpandedContentDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ExpandedContentDirective, '[expandedContent]', never, {}, {}, never, never, false, never>;
}

export declare class TabTreeComponent implements OnDestroy {
  readonly $showRootGridLines: InputSignal<boolean>;
  readonly $gridLinesBorder: InputSignal<string | undefined>;
  readonly $gridLinesBorderRadius: InputSignal<string>;
  readonly $expandButtonSize: InputSignal<string>;
  readonly $expandButtonColor: InputSignal<string | undefined>;
  readonly $expandButtonGap: InputSignal<string | undefined>;
  readonly $expandButtonTooltip: InputSignal<ExpandButtonTooltipParams | undefined>;
  readonly $expandButtonAlign: InputSignal<string>;
  readonly $childrenIndent: InputSignal<string>;
  readonly $keepButtonOffsetOnNoChildren: InputSignal<boolean>;
  readonly $hierarchyMode: InputSignal<'auto' | 'manual'>;
  readonly registry: TreeNodeRegistry;
  templateParams: TreeNodeTemplate;
  constructor();
  hierarchyModeAutoSetChildrenDepthAndId(allNodes: TabTreeNodeComponent[], node: TabTreeNodeComponent, parentNode: (TabTreeNodeComponent | null) | undefined, depth: number): void;
  hierarchyModeManualSetChildrenDepthAndId(child: TabTreeNodeComponent, currentChildDepth: number): void;
  getChildrenDisplayOrder(node: TabTreeNodeComponent): TabTreeNodeComponent[];
  ngOnDestroy(): void;
  existingGridLines: {
    id: string;
    element: HTMLDivElement;
  }[];
  redrawGridLines(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TabTreeComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TabTreeComponent,
    'tab-tree',
    never,
    {
      $showRootGridLines: {
        alias: 'showRootGridLines';
        required: false;
        isSignal: true;
      };
      $gridLinesBorder: {
        alias: 'gridLinesBorder';
        required: false;
        isSignal: true;
      };
      $gridLinesBorderRadius: {
        alias: 'gridLinesBorderRadius';
        required: false;
        isSignal: true;
      };
      $expandButtonSize: {
        alias: 'expandButtonSize';
        required: false;
        isSignal: true;
      };
      $expandButtonColor: {
        alias: 'expandButtonColor';
        required: false;
        isSignal: true;
      };
      $expandButtonGap: {
        alias: 'expandButtonGap';
        required: false;
        isSignal: true;
      };
      $expandButtonTooltip: {
        alias: 'expandButtonTooltip';
        required: false;
        isSignal: true;
      };
      $expandButtonAlign: {
        alias: 'expandButtonAlign';
        required: false;
        isSignal: true;
      };
      $childrenIndent: {
        alias: 'childrenIndent';
        required: false;
        isSignal: true;
      };
      $keepButtonOffsetOnNoChildren: {
        alias: 'keepButtonOffsetOnNoChildren';
        required: false;
        isSignal: true;
      };
      $hierarchyMode: {
        alias: 'hierarchyMode';
        required: false;
        isSignal: true;
      };
    },
    {},
    never,
    never,
    false,
    never
  >;
}

export declare class TabTreeNodeComponent implements OnInit, OnDestroy, TreeNodeInterface {
  readonly headerButtonId: string;
  readonly $expandedInput: InputSignal<boolean>;
  readonly $expanded: WritableSignal<boolean>;
  readonly expanded$: import('rxjs').Observable<boolean>;
  readonly expandedChange: import('@angular/core').OutputEmitterRef<boolean>;
  readonly $expandButtonColor: InputSignal<string | undefined>;
  readonly $template: Signal<TemplateRef<TreeNodeTemplate> | undefined>;
  readonly $hierarchyId: InputSignal<string>;
  readonly $hierarchyParentId: InputSignal<string | undefined>;
  readonly $children: WritableSignal<TabTreeNodeComponent[]>;
  readonly $parent: WritableSignal<TabTreeNodeComponent | null>;
  readonly $allParentsExpanded: Signal<boolean>;
  readonly $depth: WritableSignal<number>;
  readonly $order: InputSignal<number>;
  readonly $registry: InputSignal<TreeNodeRegistry | undefined>;
  ngOnInit(): void;
  ngOnDestroy(): void;
  setExpanded(expanded: boolean): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TabTreeNodeComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TabTreeNodeComponent,
    'tab-tree-node',
    never,
    {
      $expandedInput: {
        alias: 'expanded';
        required: false;
        isSignal: true;
      };
      $expandButtonColor: {
        alias: 'expandButtonColor';
        required: false;
        isSignal: true;
      };
      $hierarchyId: {
        alias: 'hierarchyId';
        required: false;
        isSignal: true;
      };
      $hierarchyParentId: {
        alias: 'hierarchyParentId';
        required: false;
        isSignal: true;
      };
      $order: {
        alias: 'order';
        required: false;
        isSignal: true;
      };
      $registry: {
        alias: 'registry';
        required: false;
        isSignal: true;
      };
    },
    {
      expandedChange: 'expandedChange';
    },
    ['$collapsedContent', '$expandedContent'],
    ['[expandedContent]', '[collapsedContent]', '*'],
    false,
    never
  >;
}

export declare class TableauUiTreeModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiTreeModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiTreeModule,
    [typeof TabTreeComponent, typeof TabTreeNodeComponent, typeof ExpandedContentDirective, typeof CollapsedContentDirective],
    [typeof i5.CommonModule, typeof i6.TableauUiButtonModule, typeof i7.TableauUiIconModule, typeof i8.TableauUiTooltipModule],
    [typeof TabTreeComponent, typeof TabTreeNodeComponent, typeof ExpandedContentDirective, typeof CollapsedContentDirective]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiTreeModule>;
}

interface TreeNodeInterface {
  $parent: Signal<TreeNodeInterface | null>;
  $expanded: Signal<boolean>;
}

export declare class TreeNodeRegistry {
  readonly nodes: import('@angular/core').WritableSignal<TabTreeNodeComponent[]>;
  register(node: TabTreeNodeComponent): void;
  unregister(node: TabTreeNodeComponent): void;
}

interface TreeNodeTemplate {
  $childrenIndent: Signal<string>;
  $expandButtonSize: Signal<string>;
  $expandButtonColor: Signal<string | undefined>;
  $expandButtonGap: Signal<string | undefined>;
  $expandButtonTooltip: Signal<ExpandButtonTooltipParams | undefined>;
  $expandButtonAlign: Signal<string>;
  $keepButtonOffsetOnNoChildren: Signal<boolean>;
}

export {};
