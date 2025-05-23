import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TableauUiButtonModule } from "../button/tableau-ui-button.module";
import { ExpansionPanelComponent } from "./expansion-panel.component";
import { ExpansionPanelTitleCollapsedContent, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContent } from "./expansion-panel-title.component";
import { TableauUiIconModule } from "../icon/tableau-ui-icon.module";
import { AccordionComponent } from "./accordion.component";

@NgModule({
    imports: [CommonModule, TableauUiButtonModule, TableauUiIconModule],
    declarations: [
        ExpansionPanelComponent,
        ExpansionPanelTitleCollapsedContent,
        ExpansionPanelTitleComponent,
        ExpansionPanelTitleExpandedContent,
        AccordionComponent
    ],
    exports: [
        ExpansionPanelComponent,
        ExpansionPanelTitleCollapsedContent,
        ExpansionPanelTitleComponent,
        ExpansionPanelTitleExpandedContent,
        AccordionComponent
    ]
})
export class TableauUiExpansionPanelModule {}