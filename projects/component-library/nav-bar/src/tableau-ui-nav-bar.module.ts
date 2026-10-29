import { NgModule } from '@angular/core';
import { NavBarHeaderComponent } from './nav-bar-header.component';
import { NavBarFooterComponent } from './nav-bar-footer.component';
import { NavBarButtonComponent } from './nav-bar-button/nav-bar-button.component';
import { NavBarComponent } from './nav-bar.component';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiArrowScrollModule } from 'tableau-ui-angular/arrow-scroll';

@NgModule({
  imports: [TableauUiIconModule, TableauUiTooltipModule, TableauUiButtonModule, TableauUiArrowScrollModule, NavBarButtonComponent],
  declarations: [NavBarHeaderComponent, NavBarFooterComponent, NavBarComponent],
  exports: [NavBarHeaderComponent, NavBarFooterComponent, NavBarButtonComponent, NavBarComponent],
})
export class TableauUiNavBarModule {}
