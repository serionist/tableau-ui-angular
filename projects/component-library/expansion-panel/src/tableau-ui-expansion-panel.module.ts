import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExpansionPanelComponent } from './expansion-panel.component';
import { ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective } from './expansion-panel-title.component';
import { AccordionComponent } from './accordion.component';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@NgModule({
    imports: [CommonModule, TableauUiButtonModule, TableauUiIconModule],
    declarations: [ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective, AccordionComponent],
    exports: [ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective, AccordionComponent],
})
export class TableauUiExpansionPanelModule {}
