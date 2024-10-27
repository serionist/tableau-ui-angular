import {
    Injectable,
    Inject,
    Renderer2,
    RendererFactory2,
    signal,
    computed,
    Signal,
} from '@angular/core';
import { ICON_CONFIG, IconConfig } from './icon-config';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TableauUiIconModule } from './tableau-ui-icon.module';

@Injectable({
    providedIn: TableauUiIconModule,
})
export class IconService {
    private linkElement: HTMLLinkElement | undefined;
    private renderer: Renderer2;
    private _dynamicEnabled: boolean;
    get dynamicEnabled(): boolean {
        return this._dynamicEnabled;
    }

    private iconUpdate$ = new Subject<Set<string>>();

    constructor(
        rendererFactory: RendererFactory2,
        @Inject(ICON_CONFIG) private config: IconConfig
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this._dynamicEnabled = this.config.enableDynamicIcons ?? false;

        if (this._dynamicEnabled) {
            this.iconUpdate$
                .pipe(debounceTime(100))
                .subscribe((e) => this.updateIconLink(e));

            this.updateIconLink(this.getIcons());
        }
    }
    private localIcons = new Set<string>();
    private getIcons(): Set<string> {
        if (this.config.enableDynamicIconsLocalStorageCache ?? true) {
            const iconsString = localStorage.getItem('tab-icons');
            return new Set(iconsString ? iconsString.split(',') : []);
        } else {
            return this.localIcons;
        }
    }
    private setIcons(value: Set<string>) {
        if (this.config.enableDynamicIconsLocalStorageCache ?? true) {
            localStorage.setItem('tab-icons', Array.from(value).join(','));
        } else {
            this.localIcons = value;
        }
    }

    addIcon(iconName: string): void {
        if (!this._dynamicEnabled) {
            return;
        }
        const icons = this.getIcons();
        if (icons.has(iconName)) {
            return;
        }
        icons.add(iconName);
        this.setIcons(icons);
        this.iconUpdate$.next(icons);
    }

    private _loadedIcons = new Set<string>();
    private _loadedIconsUpdated = new BehaviorSubject<Set<string>>(
        this._loadedIcons
    );
    get loadedIcons(): Observable<Set<string>> {
        return this._loadedIconsUpdated;
    }
    private updateIconLink(icons: Set<string>): void {
        if (this.linkElement) {
            this.renderer.removeChild(document.head, this.linkElement);
        }
        if (icons.size === 0) {
            return;
        }
        const iconNames = Array.from(icons).sort().join(',');
        const url = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@0..1&icon_names=${iconNames}&display=block`;

        this.linkElement = this.renderer.createElement('link');
        this.renderer.setAttribute(this.linkElement, 'rel', 'stylesheet');
        this.renderer.setAttribute(this.linkElement, 'href', url);

        this.linkElement!.onload = () => {
            for (let i of icons) {
                this._loadedIcons.add(i);
            }
            this._loadedIconsUpdated.next(this._loadedIcons);
            console.log(
                'Loaded CSS for Material Symbols Rounded icons:',
                icons
            );
        };
        this.linkElement!.onerror = (e) => {
            this._loadedIcons.clear();
            this._loadedIconsUpdated.next(this._loadedIcons);
            console.error(
                `Failed to load CSS for Material Symbols Rounded icons:`,
                icons,
                e
            );
        };

        this.renderer.appendChild(document.head, this.linkElement);
    }
}
