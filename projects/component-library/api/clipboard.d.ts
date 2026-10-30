// The public API of tableau-ui-angular/clipboard, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import * as i1 from 'tableau-ui-angular/snack';
import { SnackService } from 'tableau-ui-angular/snack';

export declare class ClipboardService {
  snackService: SnackService;
  writeText(text: string, handlePermissionError?: boolean): Promise<void>;
  readText(handlePermissionError?: boolean): Promise<string>;
  static ɵfac: i0.ɵɵFactoryDeclaration<ClipboardService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

export declare class TableauUiClipboardModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiClipboardModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiClipboardModule, never, [typeof i1.TableauUiSnackModule], never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiClipboardModule>;
}
