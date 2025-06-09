import { NgModule } from '@angular/core';
import { ResizeWatcherDirective } from './resize-watcher.directive';

@NgModule({
    declarations: [ResizeWatcherDirective],
    exports: [ResizeWatcherDirective],
})
export class TableauUiUtilsModule {}
