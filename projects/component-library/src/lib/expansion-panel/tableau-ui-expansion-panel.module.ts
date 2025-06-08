import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { ExpansionPanelComponent } from './expansion-panel.component';
import { ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective } from './expansion-panel-title.component';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { AccordionComponent } from './accordion.component';

@NgModule({
    declarations: [ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective, AccordionComponent],
    imports: [CommonModule, TableauUiButtonModule, TableauUiIconModule],
    exports: [ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective, AccordionComponent],
})
export class TableauUiExpansionPanelModule {}
