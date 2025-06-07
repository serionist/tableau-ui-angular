import { ChangeDetectionStrategy, Component, contentChild, InputSignal, model, ModelSignal, OnDestroy, OnInit, OutputRefSubscription, Signal, viewChild } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';

@Component({
    selector: 'tab-button-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonMenuComponent extends MenuComponent implements OnDestroy {
    override readonly $menuContainerCss: ModelSignal<Record<string, string>> = model<Record<string, string>>(
        {
            pointerEvents: 'none',
            marginTop: '-1px',
        },
        {
            alias: 'menuContainerCss',
        },
    );

    override readonly $closeOnBackdropClick: InputSignal<boolean> = model(true, {
        alias: 'closeOnBackdropClick',
    });
    override readonly $width: ModelSignal<'parentWidth' | 'fit-content' | string> = model('fit-content');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly menuGroup: Signal<MenuButtonGroupComponent | undefined> = contentChild(MenuButtonGroupComponent);

    readonly subs: OutputRefSubscription[] = [];
    override async open(forceReOpen: boolean = false) {
        const ref = await super.open(forceReOpen);
        if (ref && this.menuGroup()) {
            window.requestAnimationFrame(() => this.menuGroup()?.nativeElement?.nativeElement?.focus());
            const sub = this.menuGroup()?.buttonClicked.subscribe((e) => ref.close());
            if (sub) {
                this.subs.push(sub);
            }
        }
        return ref;
    }
    ngOnDestroy(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }
}
