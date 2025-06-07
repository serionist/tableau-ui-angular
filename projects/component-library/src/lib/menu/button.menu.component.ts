import {
    Component,
    contentChild,
    InputSignal,
    model,
    ModelSignal,
    OnDestroy,
    OnInit,
    OutputRefSubscription,
    Signal,
    viewChild,
} from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';

@Component({
    selector: 'tab-button-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class ButtonMenuComponent extends MenuComponent implements OnDestroy {
    override $menuContainerCss: ModelSignal<Record<string, string>> = model<Record<string, string>>({
        pointerEvents: 'none',
        marginTop: '-1px',
    }, {
        alias: 'menuContainerCss',
    });

    override $closeOnBackdropClick: InputSignal<boolean> = model(true, {
        alias: 'closeOnBackdropClick',
    });
    override $width: ModelSignal<'parentWidth' | 'fit-content' | string> =
        model('fit-content');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    menuGroup: Signal<MenuButtonGroupComponent | undefined> = contentChild(
        MenuButtonGroupComponent
    );

    readonly subs: OutputRefSubscription[] = [];
    override async open(forceReOpen: boolean = false) {
        const ref = await super.open(forceReOpen);
        if (ref && this.menuGroup()) {
            window.requestAnimationFrame(() =>
                this.menuGroup()?.nativeElement?.nativeElement?.focus()
            );
            const sub = this.menuGroup()?.buttonClicked.subscribe((e) =>
                ref.close()
            );
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
