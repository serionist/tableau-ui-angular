import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DrawerContainerComponent } from './drawer-container.component';
import { DrawerComponent } from './drawer.component';

@NgModule({
    imports: [CommonModule],
    declarations: [DrawerContainerComponent, DrawerComponent],
    exports: [DrawerContainerComponent, DrawerComponent],
})
export class TableauUiDrawerModule {}
