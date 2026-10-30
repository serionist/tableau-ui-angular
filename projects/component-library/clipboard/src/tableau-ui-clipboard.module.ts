import { NgModule } from '@angular/core';
import { TableauUiSnackModule } from 'tableau-ui-angular/snack';

// ClipboardService is provided in root and only there: one for the app, whatever imports this module
@NgModule({
  imports: [TableauUiSnackModule],
  declarations: [],
  exports: [],
})
export class TableauUiClipboardModule {}
