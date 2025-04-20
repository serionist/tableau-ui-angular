import { Component, contentChild, ElementRef, inject, input, model, signal, TemplateRef, viewChild } from '@angular/core';
import { DialogService } from '../dialogservice/dialog.service';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';
import { DialogRef } from '../dialogservice/dialog.ref';

@Component({
    selector: 'tab-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    standalone: false,
})
export class MenuComponent {
    dialogService = inject(DialogService);
    elementRef = inject(ElementRef);

    /**
     * The parent control to which the autocomplete is attached to
     */
    parentControl = model<ElementRef<HTMLElement>>();

    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    menuContainerCss = model<{ [key: string]: string }>({
        background: 'white',
        borderColor: 'var(--twc-menu-border-color)',
        borderRadius: 'var(--twc-menu-border-radius)',
        borderStyle: 'solid',
        borderWidth: '1px',
        boxShadow: 'var(--twc-menu-box-shadow)'
    });
    /**
     * The width of the container
     * @remarks
     * Use 'parentWidth' to maintain the same width as the parent control
     * Use 'fit-content' to auto size the dropdown for the content
     * Use any CSS width value (1rem, 12px, etc) to explicitly set width
     * @default 'fit-content'
     */
    width = input<'parentWidth' | 'fit-content' | string>('fit-content');
    /**
     * Trap focus within the menu
     * @remarks
     * When true, the focus will be trapped within the menu until it is closed
     * @default 'true'
     */
    trapFocus = input(true);
     /**
     * The location of the menu relative to the parent control
     * @remarks
     * The menu may be repositioned if page bounds are hit to the opposite side
     * @default 'bottom'
     */
    menuLocation = signal<'top' | 'bottom' | 'left' | 'right'>('bottom');

    prefix = contentChild<PrefixComponent>(PrefixComponent);
    suffix = contentChild<SuffixComponent>(SuffixComponent);
    template = viewChild<TemplateRef<any>>('dropdownTemplate');
    openDialog = signal<DialogRef | undefined>(undefined);

    async open(forceReOpen: boolean = false) {
        const parentControl = this.parentControl();
        if (!parentControl) {
            throw new Error('Parent control is not set. Please set the parent control before opening the menu.');
        }
        if (forceReOpen) {
            this.openDialog()?.close();
            this.openDialog.set(undefined);
        }
        if (this.openDialog()) {
           return this.openDialog();
        }

        const parentRect = parentControl.nativeElement.getBoundingClientRect();
        const ref = this.dialogService.openTemplateDialog(
            this.template()!,
            {
                top: (_, actualHeight) => {
                    switch (this.menuLocation()) {
                        case 'top':
                            const val = parentRect.top - actualHeight;
                            if (val < 0 && parentRect.bottom + actualHeight < window.innerHeight) {
                                return `${parentRect.bottom}px`;
                            }
                            return `${parentRect.top - actualHeight}px`;
                        case 'bottom':
                            const val2 = parentRect.bottom;
                            if (val2 + actualHeight > window.innerHeight && parentRect.top - actualHeight > 0) {
                                return `${parentRect.top - actualHeight}px`;
                            }
                            return `${val2}px`;
                        default:
                            const val3 = parentRect.top;
                            if (val3 < 0 && parentRect.bottom + actualHeight < window.innerHeight) {
                                return `${parentRect.bottom}px`;
                            }
                            return `${parentRect.top}px`;
                    }
                },
                left: (actualWidth, _) => {
                    switch (this.menuLocation()) {
                        case 'left':
                            const val = parentRect.left - actualWidth;
                            if (val < 0 && parentRect.right + actualWidth < window.innerWidth) {
                                return `${parentRect.right}px`;
                            }
                            return `${parentRect.left - actualWidth}px`;
                        case 'right':
                            const val2 = parentRect.right;
                            if (val2 + actualWidth > window.innerWidth && parentRect.left - actualWidth > 0) {
                                return `${parentRect.left - actualWidth}px`;
                            }
                            return `${val2}px`;
                        default:
                            const val3 = parentRect.left;
                            if (val3 < 0 && parentRect.right + actualWidth < window.innerWidth) {
                                return `${parentRect.right}px`;
                            }
                            return `${parentRect.left}px`;
                    }
                },
                width: this.width() === 'parentWidth' ? `${parentRect.width}px` : this.width(),
                closeOnBackdropClick: true,
                closeOnEscape: true,
                trapFocus: true
            }, parentControl.nativeElement
        );
        ref.afterClosed$.subscribe(() => {
            if (this.openDialog() === ref) {
                this.openDialog.set(undefined);
            }
        });
        this.openDialog.set(ref);
        return ref;
       
    }

    close() {
        this.openDialog()?.close();
    }
}
