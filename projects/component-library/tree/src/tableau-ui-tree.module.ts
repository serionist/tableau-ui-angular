import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { CollapsedContentDirective } from './collapsed-content.directive';
import { ExpandedContentDirective } from './expanded-content.directive';
import { TabTreeNodeComponent } from './tree-node.component';
import { TabTreeComponent } from './tree.component';

@NgModule({
  imports: [CommonModule, TableauUiButtonModule, TableauUiIconModule, TableauUiTooltipModule],
  declarations: [TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective],
  exports: [TabTreeComponent, TabTreeNodeComponent, ExpandedContentDirective, CollapsedContentDirective],
})
export class TableauUiTreeModule {}
