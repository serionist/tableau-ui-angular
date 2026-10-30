// The public API of tableau-ui-angular/form-field, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { AfterContentInit, OnDestroy, Signal } from '@angular/core';
import * as i4 from '@angular/forms';
import * as i3 from 'tableau-ui-angular/common';
import { ErrorComponent, HintComponent, LabelComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';

export declare class FormFieldComponent implements AfterContentInit, OnDestroy {
  constructor();
  ngAfterContentInit(): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<FormFieldComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FormFieldComponent,
    'tab-form-field',
    never,
    {},
    {},
    ['$hintElement', '$errorElement', '$labelElement', '$prefixElement', '$suffixElement'],
    ['tab-label', 'tab-prefix', '*', 'tab-suffix', 'tab-hint', 'tab-error'],
    false,
    never
  >;
}

export declare class TableauUiFormFieldModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiFormFieldModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TableauUiFormFieldModule,
    [typeof FormFieldComponent],
    [typeof i2.CommonModule, typeof i3.TableauUiCommonModule, typeof i4.ReactiveFormsModule],
    [typeof FormFieldComponent, typeof i4.ReactiveFormsModule, typeof i2.CommonModule]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiFormFieldModule>;
}
