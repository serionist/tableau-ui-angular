import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, viewChild } from '@angular/core';
import { DrawerComponent } from './drawer.component';

@Component({
    selector: 'tab-drawer-container',
    standalone: false,
    templateUrl: './drawer-container.component.html',
    styleUrl: './drawer-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerContainerComponent {
    private readonly $drawers = contentChildren(DrawerComponent);

    private readonly drawersChanged = effect(() => {
        const drawers = this.$drawers();
        console.log('Drawers changed:', drawers);
        const leftDrawers = drawers.filter((e) => e.$position() === 'left');
        const rightDrawers = drawers.filter((e) => e.$position() === 'right');
        if (leftDrawers.length > 1) {
            throw new Error('There can only be one left drawer.');
        }
        if (rightDrawers.length > 1) {
            throw new Error('There can only be one right drawer.');
        }
    });
    readonly $leftDrawer = computed(() => this.$drawers().find((e) => e.$position() === 'left'));
    readonly $rightDrawer = computed(() => this.$drawers().find((e) => e.$position() === 'right'));

    readonly $rightDrawerPositionExpression = computed(() => {
        const rightDrawer = this.$rightDrawer();
        if (!rightDrawer) {
            return '0px';
        }
        const width = rightDrawer.$width();
        let padding = rightDrawer.$padding();
        // if padding is just a number, add px
        if (/^\d+$/.test(padding)) {
            padding += 'px';
        }
        const borderWidth = this.getBorderWidth(rightDrawer.$border()) ?? '0px';
        const ret = `${width} + (${padding} * 2) + ${borderWidth}`;
        return ret;
       
    });
    readonly $leftDrawerPositionExpression = computed(() => {
        const leftDrawer = this.$leftDrawer();
        if (!leftDrawer) {
            return '0px';
        }
        const width = leftDrawer.$width();
        let padding = leftDrawer.$padding();
        // if padding is just a number, add px
        if (/^\d+$/.test(padding)) {
            padding += 'px';
        }
        const borderWidth = this.getBorderWidth(leftDrawer.$border()) ?? '0px';
        const ret = `${width} + (${padding} * 2) + ${borderWidth}`;
        return ret;
    });


    private getBorderWidth(border: string): string | null {
        const parts = border.trim().split(/\s+/);
        const widthRegex = /^(\d+(\.\d+)?)(px|em|rem|%)$/;
        for (const part of parts) {
            if (widthRegex.test(part)) {
                return part;
            }
        }
        return null;
    }
    
}
