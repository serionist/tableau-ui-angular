// The public API of tableau-ui-angular/icon, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { InputSignal } from '@angular/core';

export declare class IconComponent {
  readonly $value: InputSignal<string | undefined>;
  readonly $label: InputSignal<string | undefined>;
  readonly $color: InputSignal<'error' | 'none' | 'primary' | 'success' | null | undefined>;
  readonly $type: InputSignal<'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp'>;
  readonly $fill: InputSignal<boolean>;
  readonly $fontSize: InputSignal<string | undefined>;
  readonly $weight: InputSignal<100 | 200 | 300 | 400 | 500 | 600 | 700>;
  readonly $grade: InputSignal<0 | 200 | -25>;
  readonly $opticalSizePx: InputSignal<20 | 24 | 40 | 48>;
  readonly $params: InputSignal<Partial<IconParams> | undefined>;
  static ɵfac: i0.ɵɵFactoryDeclaration<IconComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    IconComponent,
    'tab-icon',
    never,
    {
      $value: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
      $label: {
        alias: 'label';
        required: false;
        isSignal: true;
      };
      $color: {
        alias: 'color';
        required: false;
        isSignal: true;
      };
      $type: {
        alias: 'type';
        required: false;
        isSignal: true;
      };
      $fill: {
        alias: 'fill';
        required: false;
        isSignal: true;
      };
      $fontSize: {
        alias: 'fontSize';
        required: false;
        isSignal: true;
      };
      $weight: {
        alias: 'weight';
        required: false;
        isSignal: true;
      };
      $grade: {
        alias: 'grade';
        required: false;
        isSignal: true;
      };
      $opticalSizePx: {
        alias: 'opticalSizePx';
        required: false;
        isSignal: true;
      };
      $params: {
        alias: 'params';
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

export interface IconParams {
  color?: 'error' | 'none' | 'primary' | 'success';
  type?: 'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp';
  fontSize?: string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSizePx?: 20 | 24 | 40 | 48;
}

export declare class TableauUiIconModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiIconModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiIconModule, [typeof IconComponent], [typeof i2.CommonModule], [typeof IconComponent]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiIconModule>;
}
