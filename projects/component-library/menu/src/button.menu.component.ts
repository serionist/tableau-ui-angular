import type { InputSignal, ModelSignal, OnDestroy, OutputRefSubscription, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, model } from '@angular/core';
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
    override readonly $width: ModelSignal<string | 'fit-content' | 'parentWidth'> = model('fit-content', {
        alias: 'width',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly menuGroup: Signal<MenuButtonGroupComponent | undefined> = contentChild(MenuButtonGroupComponent);

    private readonly subs: OutputRefSubscription[] = [];
    override open(forceReOpen: boolean = false) {
        const ref = super.open(forceReOpen);
        if (ref && this.menuGroup()) {
            window.requestAnimationFrame(() => this.menuGroup()?.nativeElement?.nativeElement?.focus());
            const sub = this.menuGroup()?.buttonClicked.subscribe(() => {
                ref.close();
            });
            if (sub) {
                this.subs.push(sub);
            }
        }
        return ref;
    }
    ngOnDestroy(): void {
        this.subs.forEach((sub) => {
            sub.unsubscribe();
        });
    }
}
