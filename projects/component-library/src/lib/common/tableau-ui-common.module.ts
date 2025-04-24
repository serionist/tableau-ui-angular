import { NgModule } from '@angular/core';
import { ErrorComponent } from './error';
import { HintComponent } from './hint';
import { OptionComponent } from './option';
import { SeparatorComponent } from './separator';
import { CommonModule } from '@angular/common';
import { LoadingGifComponent } from './loading-gif.component';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { PrefixComponent } from './prefix';
import { SuffixComponent } from './suffix';
import { ResizeWatcherDirective } from './utils/resize-watcher.directive';

@NgModule({
    imports: [CommonModule, TableauUiIconModule],
    declarations: [
        ErrorComponent,
        HintComponent,
        OptionComponent,
        PrefixComponent,
        SuffixComponent,
        SeparatorComponent,
        LoadingGifComponent,
        ResizeWatcherDirective,
    ],
    exports: [
        ErrorComponent,
        HintComponent,
        OptionComponent,
        SeparatorComponent,
        LoadingGifComponent,
        PrefixComponent,
        SuffixComponent,
        ResizeWatcherDirective,
    ],
})
export class TableauUiCommonModule {}
