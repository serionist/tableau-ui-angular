import type { ModelSignal, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { DialogService } from '../dialogservice/dialog.service';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';
import type { DialogRef } from '../dialogservice/dialog.ref';

@Component({
    selector: 'tab-menu',
    standalone: false,
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
    private readonly dialogService = inject(DialogService);
    private readonly elementRef = inject(ElementRef);

    /**
     * The parent control to which the autocomplete is attached to
     * // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
     */
    readonly $parentControl: ModelSignal<ElementRef<HTMLElement> | undefined> = model<ElementRef<HTMLElement>>();

    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    readonly $menuContainerCss = model<Record<string, string>>(
        {
            marginTop: '-1px',
            background: 'var(--twc-color-base)',
            borderColor: 'var(--twc-color-border-light)',
            borderRadius: 'var(--twc-menu-border-radius)',
            borderStyle: 'solid',
            borderWidth: '1px',
            boxShadow: 'var(--twc-dialog-box-shadow)',
        },
        {
            alias: 'menuContainerCss',
        },
    );
    // The default CSS text to apply to the dropdown container. This is used to set the default values for the menuContainerCss property.
    private readonly defaultContainerCss: Record<string, string> = {
        outline: 'none',
        color: 'var(--twc-color-text)',
        lineHeight: 'normal',
        overFlowY: 'auto',
        overFlowX: 'hidden',
        userSelect: 'none',
    };

    /**
     * The CSS text to apply to the backdrop container
     * @remarks
     * Use this to apply user-select: none, etc. to the backdrop container
     * @default '{}'
     */
    readonly $backdropCss = model<Record<string, string>>(
        {},
        {
            alias: 'backdropCss',
        },
    );
    /**
     * The width of the container
     * @remarks
     * Use 'parentWidth' to maintain the same width as the parent control
     * Use 'fit-content' to auto size the dropdown for the content
     * Use any CSS width value (1rem, 12px, etc) to explicitly set width
     * @default 'fit-content'
     */
    readonly $width = input<string | 'fit-content' | 'parentWidth'>('fit-content', {
        alias: 'width',
    });
    /**
     * The max width of the container
     * @remarks
     * Keep it undefined for default behavior
     * Use any CSS width value (1rem, 12px, etc) to explicitly set minimum width
     * @default 'undefined'
     */
    readonly $maxWidth = input<string | undefined>(undefined, {
        alias: 'maxWidth',
    });
    /**
     * The height of the container
     * @remarks
     * Use 'fit-content' to auto size the dropdown for the content
     * Use any CSS height value (1rem, 12px, etc) to explicitly set height
     * @default 'fit-content'
     */
    readonly $height = input<string>('fit-content', {
        alias: 'height',
    });
    /**
     * The max height of the container
     * @remarks
     * Keep it undefined for default behavior
     * Use any CSS height value (1rem, 12px, etc) to explicitly set maximum height
     * @default 'undefined'
     */
    readonly $maxHeight = input<string | undefined>(undefined, {
        alias: 'maxHeight',
    });

    /**
     * Close on backdrop click
     * @remarks
     * When true, the menu will close when the backdrop is clicked
     * @default 'true'
     */
    readonly $closeOnBackdropClick = input(true, {
        alias: 'closeOnBackdropClick',
    });
    /**
     * Close on escape key press
     * @remarks
     * When true, the menu will close when the escape key is pressed
     * @default 'true'
     */
    readonly $closeOnEscape = input(true, {
        alias: 'closeOnEscape',
    });

    /**
     * Trap focus within the menu
     * @remarks
     * When true, the focus will be trapped within the menu until it is closed
     * @default 'true'
     */
    readonly $trapFocus = input(true, {
        alias: 'trapFocus',
    });
    /**
     * The location of the menu relative to the parent control
     * @remarks
     * The menu may be repositioned if page bounds are hit to the opposite side
     * @default 'bottom'
     */
    readonly $menuLocation = input<'bottom' | 'left' | 'right' | 'top'>('bottom', {
        alias: 'menuLocation',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $prefix: Signal<PrefixComponent | undefined> = contentChild<PrefixComponent>(PrefixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $suffix: Signal<SuffixComponent | undefined> = contentChild<SuffixComponent>(SuffixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    private readonly $template: Signal<TemplateRef<null> | undefined> = viewChild<TemplateRef<null>>('dropdownTemplate');
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    private readonly $openDialog: WritableSignal<DialogRef | undefined> = signal<DialogRef | undefined>(undefined);

    open(forceReOpen: boolean = false) {
        const template = this.$template();
        const parentControl = this.$parentControl();
        if (!parentControl) {
            throw new Error('Parent control is not set. Please set the parent control before opening the menu.');
        }
        if (forceReOpen) {
            this.$openDialog()?.close();
            this.$openDialog.set(undefined);
        }
        if (this.$openDialog()) {
            return this.$openDialog();
        }

        const ref = this.dialogService.openTemplateDialog(
            this.$template()!,
            {
                top: (_, actualHeight, parentRect) => {
                    switch (this.$menuLocation()) {
                        case 'top': {
                            const val = parentRect!.top - actualHeight;
                            if (val < 0 && parentRect!.bottom + actualHeight < window.innerHeight) {
                                return `${parentRect!.bottom}px`;
                            }
                            return `${parentRect!.top - actualHeight}px`;
                        }
                        case 'bottom': {
                            const val = parentRect!.bottom;
                            if (val + actualHeight > window.innerHeight && parentRect!.top - actualHeight > 0) {
                                return `${parentRect!.top - actualHeight}px`;
                            }
                            return `${val}px`;
                        }
                        case 'left':
                        case 'right': {
                            // the top parameter is the top parameter of the parent control by default
                            let { top } = parentRect!;
                            // if it is higher than the availale window
                            if (top + actualHeight > window.innerHeight) {
                                top = window.innerHeight - actualHeight;
                            }
                            top = Math.max(top, 0);
                            return `${top}px`;
                        }
                        default: {
                            throw new Error(`Invalid menu location: ${this.$menuLocation()}`);
                        }
                    }
                },
                left: (actualWidth, _, parentRect) => {
                    switch (this.$menuLocation()) {
                        case 'left': {
                            const val = parentRect!.left - actualWidth;
                            if (val < 0 && parentRect!.right + actualWidth < window.innerWidth) {
                                return `${parentRect!.right}px`;
                            }
                            return `${parentRect!.left - actualWidth}px`;
                        }
                        case 'right': {
                            const val = parentRect!.right;
                            if (val + actualWidth > window.innerWidth && parentRect!.left - actualWidth > 0) {
                                return `${parentRect!.left - actualWidth}px`;
                            }
                            return `${val}px`;
                        }
                        case 'top':
                        case 'bottom': {
                            // the left parameter is the left parameter of the parent control by default
                            let { left } = parentRect!;
                            // if it is wider than the availale window
                            if (left + actualWidth > window.innerWidth) {
                                left = window.innerWidth - actualWidth;
                            }
                            left = Math.max(left, 0);
                            return `${left}px`;
                        }
                        default: {
                            throw new Error(`Invalid menu location: ${this.$menuLocation()}`);
                        }
                    }
                },

                width: (parentRect) => {
                    return this.$width() === 'parentWidth' ? `${parentRect!.width}px` : this.$width();
                },
                closeOnBackdropClick: this.$closeOnBackdropClick(),
                closeOnEscape: this.$closeOnEscape(),
                trapFocus: this.$trapFocus(),
                height: this.$height(),
                maxHeight: this.$maxHeight(),
                maxWidth: this.$maxWidth(),
                containerCss: {
                    ...this.defaultContainerCss,
                    ...this.$menuContainerCss(),
                },
                backdropCss: this.$backdropCss(),
            },
            null,
            parentControl.nativeElement,
        );
        ref.closed$.subscribe(() => {
            if (this.$openDialog() === ref) {
                this.$openDialog.set(undefined);
            }
        });
        this.$openDialog.set(ref);
        return ref;
    }

    close() {
        this.$openDialog()?.close();
    }
}
