// The public API of tableau-ui-angular/expansion-panel, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal, OnDestroy, OnInit, Signal } from '@angular/core';
import * as i5 from 'tableau-ui-angular/button';
import * as i6 from 'tableau-ui-angular/icon';

export declare class AccordionComponent {
  readonly registry: AccordionRegistry;
  static ɵfac: i0.ɵɵFactoryDeclaration<AccordionComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<AccordionComponent, 'tab-accordion', never, {}, {}, never, ['tab-expansion-panel'], false, never>;
}

export declare class AccordionRegistry {
  readonly nodes: import('@angular/core').WritableSignal<ExpansionPanelComponent[]>;
  register(node: ExpansionPanelComponent): void;
  unregister(node: ExpansionPanelComponent): void;
}

export declare class ExpansionPanelComponent implements OnInit, OnDestroy {
  readonly id: string;
  readonly $expanded: import('@angular/core').ModelSignal<boolean>;
  readonly expandedChange$: import('rxjs').Observable<boolean>;
  readonly $disabled: InputSignal<boolean>;
  readonly $noHeaderHover: InputSignal<boolean>;
  readonly $label: InputSignal<string | undefined>;
  readonly $registry: InputSignal<AccordionRegistry | undefined>;
  ngOnInit(): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ExpansionPanelComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExpansionPanelComponent,
    'tab-expansion-panel',
    never,
    {
      $expanded: {
        alias: 'expanded';
        required: false;
        isSignal: true;
      };
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $noHeaderHover: {
        alias: 'noHeaderHover';
        required: false;
        isSignal: true;
      };
      $label: {
        alias: 'label';
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
      $expanded: 'expandedChange';
    },
    ['$expandedHeader', '$collapsedHeader', '$title'],
    ['tab-expansion-panel-title[expanded]', 'tab-expansion-panel-title[collapsed]', 'tab-expansion-panel-title', '*'],
    false,
    never
  >;
}

export declare class ExpansionPanelTitleCollapsedContentDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<ExpansionPanelTitleCollapsedContentDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ExpansionPanelTitleCollapsedContentDirective, 'tab-expansion-panel-title[collapsed]', never, {}, {}, never, never, false, never>;
}

export declare class ExpansionPanelTitleComponent {
  static ɵfac: i0.ɵɵFactoryDeclaration<ExpansionPanelTitleComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<ExpansionPanelTitleComponent, 'tab-expansion-panel-title', never, {}, {}, never, ['*'], false, never>;
}

export declare class ExpansionPanelTitleExpandedContentDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<ExpansionPanelTitleExpandedContentDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<ExpansionPanelTitleExpandedContentDirective, 'tab-expansion-panel-title[expanded]', never, {}, {}, never, never, false, never>;
}

export declare class TableauUiExpansionPanelModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiExpansionPanelModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiExpansionPanelModule,
    [
      typeof ExpansionPanelComponent,
      typeof ExpansionPanelTitleCollapsedContentDirective,
      typeof ExpansionPanelTitleComponent,
      typeof ExpansionPanelTitleExpandedContentDirective,
      typeof AccordionComponent,
    ],
    [typeof i4.CommonModule, typeof i5.TableauUiButtonModule, typeof i6.TableauUiIconModule],
    [
      typeof ExpansionPanelComponent,
      typeof ExpansionPanelTitleCollapsedContentDirective,
      typeof ExpansionPanelTitleComponent,
      typeof ExpansionPanelTitleExpandedContentDirective,
      typeof AccordionComponent,
    ]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiExpansionPanelModule>;
}
