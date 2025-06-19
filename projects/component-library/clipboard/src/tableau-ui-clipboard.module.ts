import { NgModule } from '@angular/core';
import { TableauUiSnackModule } from 'tableau-ui-angular/snack';
import { ClipboardService } from './clipboard.service';

@NgModule({
  imports: [TableauUiSnackModule],
  declarations: [],
  providers: [ClipboardService],
  exports: [],
})
export class TableauUiClipboardModule {}
