import { NgModule } from '@angular/core';
import { ErrorComponent } from './error';
import { HintComponent } from './hint';
import { OptionComponent } from './option';
import { SeparatorComponent } from './separator';
import { CommonModule } from '@angular/common';
import { LoadingGifComponent } from './loading-gif.component';
import { PrefixComponent } from './prefix';
import { SuffixComponent } from './suffix';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiUtilsModule } from 'tableau-ui-angular/utils';
import { LabelComponent } from './label';

@NgModule({
  imports: [CommonModule, TableauUiIconModule, TableauUiUtilsModule],
  declarations: [ErrorComponent, HintComponent, OptionComponent, PrefixComponent, SuffixComponent, SeparatorComponent, LoadingGifComponent, LabelComponent],
  exports: [ErrorComponent, HintComponent, OptionComponent, SeparatorComponent, LoadingGifComponent, PrefixComponent, SuffixComponent, LabelComponent],
})
export class TableauUiCommonModule {}
