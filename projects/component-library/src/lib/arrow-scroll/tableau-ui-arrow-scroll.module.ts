import { NgModule } from '@angular/core';
import { ArrowScrollComponent } from './arrow-scroll.component';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';

@NgModule({
    imports: [TableauUiButtonModule, TableauUiCommonModule],
    declarations: [ArrowScrollComponent],
    providers: [],
    exports: [ArrowScrollComponent],
})
export class TableauUiArrowScrollModule {}
