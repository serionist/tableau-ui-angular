// The public API of tableau-ui-angular/tab-group, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i3 from '@angular/common';
import * as i0 from '@angular/core';
import { AfterContentChecked, ElementRef, InputSignal, Signal, TemplateRef } from '@angular/core';
import * as i4 from 'tableau-ui-angular/arrow-scroll';
import * as i5 from 'tableau-ui-angular/icon';

export declare class TabComponent {
  readonly $headerTemplate: import('@angular/core').Signal<TemplateRef<unknown>>;
  readonly $contentTemplate: import('@angular/core').Signal<TemplateRef<unknown>>;
  readonly $disabled: import('@angular/core').InputSignal<boolean>;
  readonly $key: import('@angular/core').InputSignal<string | undefined>;
  readonly afterActivate: import('@angular/core').OutputEmitterRef<void>;
  static ɵfac: i0.ɵɵFactoryDeclaration<TabComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TabComponent,
    'tab',
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $key: {
        alias: 'key';
        required: false;
        isSignal: true;
      };
    },
    {
      afterActivate: 'afterActivate';
    },
    never,
    ['[tab-header]', '*'],
    false,
    never
  >;
}

export declare class TabGroupComponent implements AfterContentChecked {
  readonly $headerPadding: InputSignal<string>;
  readonly $scrollArrowsIconSize: InputSignal<string>;
  readonly $autoSelectFirstTab: InputSignal<boolean>;
  readonly $label: InputSignal<string | undefined>;
  get $selectedIndex(): Signal<number>;
  readonly $selectedTab: Signal<TabComponent | null>;
  readonly tabSelected: import('@angular/core').OutputEmitterRef<{
    index: number;
    key: string | undefined;
    tab: TabComponent;
  }>;
  ngAfterContentChecked(): void;
  selectTabByIndex(index: number): void;
  selectTabByKey(key: string): void;
  onkeydown(index: number, e: KeyboardEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<TabGroupComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TabGroupComponent,
    'tab-group',
    never,
    {
      $headerPadding: {
        alias: 'headerPadding';
        required: false;
        isSignal: true;
      };
      $scrollArrowsIconSize: {
        alias: 'scrollArrowsIconSize';
        required: false;
        isSignal: true;
      };
      $autoSelectFirstTab: {
        alias: 'autoSelectFirstTab';
        required: false;
        isSignal: true;
      };
      $label: {
        alias: 'label';
        required: false;
        isSignal: true;
      };
    },
    {
      tabSelected: 'tabSelected';
    },
    ['$tabs'],
    never,
    false,
    never
  >;
}

export declare class TableauUiTabgroupModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiTabgroupModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiTabgroupModule,
    [typeof TabComponent, typeof TabGroupComponent],
    [typeof i3.CommonModule, typeof i4.TableauUiArrowScrollModule, typeof i5.TableauUiIconModule],
    [typeof TabComponent, typeof TabGroupComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiTabgroupModule>;
}
