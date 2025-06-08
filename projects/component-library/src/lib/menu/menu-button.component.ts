import type { ElementRef, InputSignal, OnDestroy, TemplateRef, WritableSignal } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, Component, contentChild, contentChildren, effect, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { MenuComponent } from './menu.component';
import { generateRandomString } from '../utils';

@Component({
    selector: 'tab-menu-button',
    standalone: false,
    template: `
        <ng-template #template>
            <div
                class="menu-button"
                role="button"
                type="button"
                tabindex="-1"
                [ngClass]="$color()"
                [class.loading]="$loading()"
                [class.highlight]="$highlight()"
                [attr.disabled]="$disabled() || $loading() ? true : false"
                [id]="id"
                (mouseenter)="onMouseEnter()"
                (mouseleave)="onMouseLeave()"
                (mousedown)="onMouseDown($event)"
                (click)="onClick($event)"
            >
                @if ($loading()) {
                    <span class="loader-wrapper">
                        <img
                            alt="Wait indicator"
                            class="f79w7hb"
                            src="data:image/svg+xml,%0A%3Csvg%20viewBox%3D%220%200%2050%2050%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cstyle%3E%0A%20%20%20%20%23tail%20%7B%20fill%3A%20url(%23fade)%20%7D%0A%20%20%20%20%23head%20%7B%20fill%3A%20rgb(97%2C%20101%2C%20112)%20%7D%0A%20%20%20%20stop%20%7B%20stop-color%3A%20rgb(97%2C%20101%2C%20112)%20%7D%0A%20%20%3C%2Fstyle%3E%0A%20%20%3ClinearGradient%20id%3D%22fade%22%20x2%3D%2250%22%20y1%3D%2225%22%20y2%3D%2225%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%0A%20%20%20%20%3Cstop%20offset%3D%220%22%20stop-opacity%3D%220%22%2F%3E%0A%20%20%20%20%3Cstop%20offset%3D%22.15%22%20stop-opacity%3D%22.04%22%2F%3E%0A%20%20%20%20%3Cstop%20offset%3D%22.3%22%20stop-opacity%3D%22.16%22%2F%3E%0A%20%20%20%20%3Cstop%20offset%3D%22.45%22%20stop-opacity%3D%22.36%22%2F%3E%0A%20%20%20%20%3Cstop%20offset%3D%22.61%22%20stop-opacity%3D%22.64%22%2F%3E%0A%20%20%20%20%3Cstop%20offset%3D%22.76%22%2F%3E%0A%20%20%3C%2FlinearGradient%3E%0A%20%20%3Cpath%20id%3D%22head%22%20d%3D%22M0%2025a25%2025%200%201%200%2050%200h-3.9a21.1%2021.1%200%201%201-42.2%200%22%20%2F%3E%0A%20%20%3Cpath%20id%3D%22tail%22%20d%3D%22M50%2025a25%2025%200%200%200-50%200h3.9a21.1%2021.1%200%201%201%2042.2%200%22%20%2F%3E%0A%3C%2Fsvg%3E"
                        />
                    </span>
                }
                <div class="button-content"><ng-content /></div>
                @if ($children().length > 0) {
                    <tab-icon class="expand" value="keyboard_arrow_right" />
                }
            </div>
        </ng-template>
    `,
    styleUrl: './menu-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonComponent implements OnDestroy {
    readonly id: string;
    protected readonly contentElement = viewChild<ElementRef>('buttonElement');
    readonly $disabled = input(false, {
        alias: 'disabled',
    });
    readonly $loading = input(false, {
        alias: 'loading',
    });
    readonly $color = input<'error' | 'plain' | 'primary' | 'secondary'>('secondary', {
        alias: 'color',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $hoverToOpenSubMenuMs: InputSignal<number | undefined> = input<number | undefined>(undefined, {
        alias: 'hoverToOpenSubMenuMs',
    });

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $actualHoverMs: WritableSignal<number | undefined> = signal<number | undefined>(undefined);
    readonly updateChildrenHover = effect(() => {
        const hoverMs = this.$actualHoverMs();
        const children = this.$children();
        for (const child of children) {
            if (child.$hoverToOpenSubMenuMs() !== undefined) {
                child.$actualHoverMs.set(child.$hoverToOpenSubMenuMs());
            } else {
                child.$actualHoverMs.set(hoverMs);
            }
        }
    });
    // children = contentChildren(MenuButtonComponent);

    readonly $highlight = signal(false);
    highlightEffect = effect(() => {
        this.highlightChange.emit(this.$highlight());
    });
    readonly highlightChange = output<boolean>();

    readonly $children = contentChildren(MenuButtonComponent);
    readonly mouseoverChange = output<boolean>();
    readonly $template = viewChild.required<TemplateRef<null>>('template');

    readonly openSubMenu = output<Event>();

    // eslint-disable-next-line @angular-eslint/no-output-native
    readonly click = output<Event>();
    constructor() {
        this.id = generateRandomString();
    }

    hoverInterval: ReturnType<typeof setTimeout> | undefined = undefined;
    hoverstart = Date.now();
    onMouseEnter() {
        if (!this.$disabled()) {
            this.mouseoverChange.emit(true);
            const hoverMs = this.$actualHoverMs();
            if (hoverMs !== undefined && this.$children().length > 0) {
                this.hoverstart = Date.now();
                this.hoverInterval = setInterval(() => {
                    if (Date.now() - this.hoverstart > hoverMs) {
                        this.openSubMenu.emit(new Event('mouseenter'));
                        if (this.hoverInterval) {
                            clearInterval(this.hoverInterval);
                        }
                    }
                }, 50);
            }
        }
    }
    onMouseLeave() {
        if (this.hoverInterval) {
            clearInterval(this.hoverInterval);
        }
        this.$highlight.set(false);
    }

    ngOnDestroy(): void {
        if (this.hoverInterval) {
            clearInterval(this.hoverInterval);
        }
    }

    onMouseDown(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }

    onClick(e: Event) {
        if (this.$disabled()) {
            return;
        }
        if (this.$children().length > 0) {
            this.openSubMenu.emit(e);
            e.preventDefault();
            e.stopPropagation();
        } else {
            this.click.emit(e);
        }
    }

    // @HostListener('click', ['$event'])
    // onClick(e: Event) {
    //     if (!this.disabled() && this.childMenu() !== undefined) {
    //         this.childMenu()?.open();
    //         e.preventDefault();
    //         e.stopPropagation();
    //     }
    // }
}
