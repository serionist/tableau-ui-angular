import { ChangeDetectionStrategy, Component, computed, contentChildren, effect } from '@angular/core';
import { DrawerComponent } from './drawer.component';

@Component({
    selector: 'tab-drawer-container',
    standalone: false,
    template: `
        @let leftDrawer = $leftDrawer();
        @if (leftDrawer) {
            <div
                class="drawer left"
                [style.overflow]="!leftDrawer.$isOpen() ? 'hidden' : undefined"
                [style.height]="!leftDrawer.$isOpen() ? '0px' : undefined"
                [style.width]="!leftDrawer.$isOpen() ? '0' : leftDrawer?.$width()"
                [style.borderRight]="leftDrawer.$border()"
                [style.marginRight]="leftDrawer.$padding()"
                [style.paddingRight]="leftDrawer.$padding()"
            >
                <ng-container [ngTemplateOutlet]="leftDrawer.$template()" />
            </div>
        }
        <div class="drawer-content">
            <ng-content />
        </div>
        @let rightDrawer = $rightDrawer();
        @if (rightDrawer) {
            <div
                class="drawer right"
                [style.overflow]="!rightDrawer.$isOpen() ? 'hidden' : undefined"
                [style.height]="!rightDrawer.$isOpen() ? '0px' : undefined"
                [style.width]="!rightDrawer || !rightDrawer.$isOpen() ? '0' : rightDrawer?.$width()"
                [style.borderLeft]="rightDrawer.$border()"
                [style.marginLeft]="rightDrawer.$padding()"
                [style.paddingLeft]="rightDrawer.$padding()"
            >
                <ng-container [ngTemplateOutlet]="rightDrawer.$template()" />
            </div>
        }
    `,
    styles: `
        :host {
            display: grid;
            grid-template-columns: auto 1fr auto;
            width: 100%;
            height: 100%;
            grid-template-rows: 1fr;
            overflow: auto;
        }
        :host > * {
            overflow: auto;
        }
        .drawer {
            transition: width 0.2s ease-in-out;
        }
        .left {
            grid-column: 1;
        }
        .drawer-content {
            grid-column: 2;
        }
        .right {
            grid-column: 3;
        }
    `,
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
}
