import { NgModule } from '@angular/core';
import { ArrowScrollComponent } from './arrow-scroll.component';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { TableauUiCommonModule } from '../common/tableau-ui-common.module';

@NgModule({
    declarations: [ArrowScrollComponent],
    imports: [TableauUiButtonModule, TableauUiCommonModule],
    exports: [ArrowScrollComponent],
    providers: [],
})
export class TableauUiArrowScrollModule {}
