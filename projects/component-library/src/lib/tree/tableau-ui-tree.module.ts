import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabTreeComponent } from './tree.component';
import { TabTreeNodeComponent } from './tree-node.component';
import { TableauUiButtonModule } from '../button/tableau-ui-button.module';
import { TableauUiIconModule } from '../icon/tableau-ui-icon.module';
import { TableauUiTooltipModule } from '../tooltip/tableau-ui-tooltip.module';
import { ExpandedContentDirective } from './expanded-content.directive';
import { CollapsedContentDirective } from './collapsed-content.directive';

@NgModule({
    imports: [
        CommonModule,
        TableauUiButtonModule,
        TableauUiIconModule,
        TableauUiTooltipModule,
    ],
    declarations: [TabTreeComponent, TabTreeNodeComponent,
        ExpandedContentDirective, CollapsedContentDirective
    ],
    exports: [TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective],
})
export class TableauUiTreeModule {}
