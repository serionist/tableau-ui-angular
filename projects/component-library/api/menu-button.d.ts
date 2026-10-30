// The public API of tableau-ui-angular/menu-button, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i4 from '@angular/common';
import * as i0 from '@angular/core';
import { ElementRef, InputSignal, OnDestroy, OutputRefSubscription, PipeTransform, TemplateRef, WritableSignal } from '@angular/core';
import * as i5 from 'tableau-ui-angular/icon';
import { ButtonMenuDirective } from 'tableau-ui-angular/menu';
import * as i6 from 'tableau-ui-angular/utils';

declare class EntriesPipe implements PipeTransform {
  transform<T>(arr: readonly T[]): [number, T][];
  static ɵfac: i0.ɵɵFactoryDeclaration<EntriesPipe, never>;
  static ɵpipe: i0.ɵɵPipeDeclaration<EntriesPipe, 'entries', false>;
}

interface IMenuGroup {
  id: string;
  $top: WritableSignal<number>;
  $left: WritableSignal<number>;
  $position: WritableSignal<'absolute' | 'fixed'>;
  $minWidth: WritableSignal<string>;
  parentButton: HTMLElement | null;
  buttons: readonly MenuButtonComponent[];
  element: Element | null;
  mouseoverSubscriptions: OutputRefSubscription[];
  openSubMenuSubscriptions: OutputRefSubscription[];
  clickSubscriptions: OutputRefSubscription[];
  highlightSubscriptions: OutputRefSubscription[];
}

export declare class MenuButtonComponent implements OnDestroy {
  readonly id: string;
  readonly $disabled: InputSignal<boolean>;
  readonly $loading: InputSignal<boolean>;
  readonly $color: InputSignal<'error' | 'plain' | 'primary' | 'secondary'>;
  readonly $hoverToOpenSubMenuMs: InputSignal<number | undefined>;
  readonly $actualHoverMs: WritableSignal<number | undefined>;
  readonly updateChildrenHover: import('@angular/core').EffectRef;
  readonly $highlight: WritableSignal<boolean>;
  highlightEffect: import('@angular/core').EffectRef;
  readonly highlightChange: import('@angular/core').OutputEmitterRef<boolean>;
  readonly $children: import('@angular/core').Signal<readonly MenuButtonComponent[]>;
  readonly mouseoverChange: import('@angular/core').OutputEmitterRef<boolean>;
  readonly $template: import('@angular/core').Signal<TemplateRef<null>>;
  readonly openSubMenu: import('@angular/core').OutputEmitterRef<Event>;
  readonly clicked: import('@angular/core').OutputEmitterRef<Event>;
  constructor();
  hoverInterval: ReturnType<typeof setTimeout> | undefined;
  hoverstart: number;
  onMouseEnter(): void;
  onMouseLeave(): void;
  ngOnDestroy(): void;
  onMouseDown(e: Event): void;
  onClick(e: Event): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<MenuButtonComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MenuButtonComponent,
    'tab-menu-button',
    never,
    {
      $disabled: {
        alias: 'disabled';
        required: false;
        isSignal: true;
      };
      $loading: {
        alias: 'loading';
        required: false;
        isSignal: true;
      };
      $color: {
        alias: 'color';
        required: false;
        isSignal: true;
      };
      $hoverToOpenSubMenuMs: {
        alias: 'hoverToOpenSubMenuMs';
        required: false;
        isSignal: true;
      };
    },
    {
      highlightChange: 'highlightChange';
      mouseoverChange: 'mouseoverChange';
      openSubMenu: 'openSubMenu';
      clicked: 'clicked';
    },
    ['$children'],
    ['*'],
    false,
    never
  >;
}

export declare class MenuButtonGroupComponent implements OnDestroy {
  readonly nativeElement: ElementRef<HTMLElement>;
  readonly menu: ButtonMenuDirective | null;
  readonly $hoverToOpenSubMenuMs: InputSignal<number | undefined>;
  readonly buttonClicked: import('@angular/core').OutputEmitterRef<{
    button: MenuButtonComponent;
    event: Event;
  }>;
  readonly childrenEffect: import('@angular/core').EffectRef;
  readonly $menuGroupStack: WritableSignal<IMenuGroup[]>;
  constructor();
  init(): void;
  ngOnDestroy(): void;
  addMenuGroup(parentButton?: MenuButtonComponent): IMenuGroup | undefined;
  updateSizes(): void;
  destroyGroupsUntil(id?: string): void;
  onFocusIn(event?: FocusEvent): void;
  onFocusOut(event?: FocusEvent): void;
  onKeyDown(event: KeyboardEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<MenuButtonGroupComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MenuButtonGroupComponent,
    'tab-menu-button-group',
    never,
    {
      $hoverToOpenSubMenuMs: {
        alias: 'hoverToOpenSubMenuMs';
        required: false;
        isSignal: true;
      };
    },
    {
      buttonClicked: 'buttonClicked';
    },
    ['$children'],
    never,
    false,
    never
  >;
}

export declare class TableauUiMenuButtonModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiMenuButtonModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiMenuButtonModule,
    [typeof MenuButtonComponent, typeof MenuButtonGroupComponent, typeof EntriesPipe],
    [typeof i4.CommonModule, typeof i5.TableauUiIconModule, typeof i6.TableauUiUtilsModule],
    [typeof MenuButtonComponent, typeof MenuButtonGroupComponent]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiMenuButtonModule>;
}

export {};
