import { AccordionComponent, ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective } from 'tableau-ui-angular/expansion-panel';

export function importExpansionPanel() {
    return [ExpansionPanelComponent, ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleComponent, ExpansionPanelTitleExpandedContentDirective];
}
export function importAccordion() {
    return [...importExpansionPanel(), AccordionComponent];
}
