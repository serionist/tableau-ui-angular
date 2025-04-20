import { Component, contentChild, model, ModelSignal, OnDestroy, OnInit, OutputRefSubscription, viewChild } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuButtonGroupComponent } from './menu-button-group.component';

@Component({
    selector: 'tab-button-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class ButtonMenuComponent extends MenuComponent implements OnDestroy  {
   
    override menuContainerCss: ModelSignal<{ [key: string]: string }> = model(
        {}
    );
    override width: ModelSignal<'parentWidth' | 'fit-content' | string> =
        model('fit-content');

    menuGroup = contentChild(MenuButtonGroupComponent);

    readonly subs: OutputRefSubscription[] = [];
    override async open(forceReOpen: boolean = false) {
        const ref = await super.open(forceReOpen);
        if (ref && this.menuGroup()) {
          window.requestAnimationFrame(() => this.menuGroup()?.nativeElement?.nativeElement?.focus());
          const sub = this.menuGroup()?.buttonClicked.subscribe(e => this.close());
          if (sub) {
            this.subs.push(sub);
          }
        }
        return ref;
    }
    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
    
}
