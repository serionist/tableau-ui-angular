import {
    Component,
    contentChild,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    model,
    OnDestroy,
    OnInit,
    signal,
    TemplateRef,
    viewChild,
} from '@angular/core';
import { IOptionGridContext, OptionComponent } from '../common/option';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';
import { DialogService } from '../dialogservice/dialog.service';
import { DialogRef } from '../dialogservice/dialog.ref';
import { fromEvent, map, Subscription } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
    selector: 'tab-autocomplete',
    standalone: false,
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss'],
})
export class AutoCompleteComponent implements OnInit, OnDestroy {
    dialogService = inject(DialogService);
    elementRef = inject(ElementRef);

    dropdownId: string;

    /**
     * The parent control to which the autocomplete is attached to
     */
    parentControl = input.required<HTMLInputElement>();
    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    dropdownContainerCss = model<{ [key: string]: string }>({});
    /**
     * The CSS text to apply to the options container in the dropdown
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown
     * This is applied to the options container, excluding the prefix & suffix
     *
     * @default "{ maxHeight: '300px', height: 'fit-content'}"
     */
    dropdownOptionsContainerCss = model<{ [key: string]: string }>({
        maxHeight: '300px',
        height: 'fit-content',
    });
    /**
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    dropdownValueTemplateContext = model<IOptionGridContext>({
        renderIcon: true,
        renderText: true,
        renderHint: true,
    });

    options = contentChildren<OptionComponent>(OptionComponent);
    dropdownPrefix = contentChild<PrefixComponent>(PrefixComponent);
    dropdownSuffix = contentChild<SuffixComponent>(SuffixComponent);
    dropdownTemplate = viewChild<TemplateRef<any>>('dropdownTemplate');

    constructor() {
        const id = this.generateId();
        this.dropdownId = `dropdown-${id}`;
        toObservable(this.options).subscribe((options) => {
            this.highlightedOption.set(undefined);
        });
    }
    generateId(length: number = 16): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomName = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomName += characters.charAt(randomIndex);
        }

        return `${randomName}`;
    }
    ngOnInit(): void {
        this.parentControl().addEventListener('focus', () =>
            this.openDropdown()
        );
        this.parentControl().addEventListener('blur', () =>
            this.closeDropdown()
        );
        this.parentControl().addEventListener('click', () => this.openDropdown());
        this.parentControl().addEventListener('input', () => this.openDropdown());
    
    }
    ngOnDestroy(): void {
        this.parentControl().removeEventListener('focus', () =>
            this.openDropdown()
        );
        this.parentControl().removeEventListener('blur', () =>
            this.closeDropdown()
        );
        this.parentControl().removeEventListener('mouseup', () =>
            this.openDropdown()
        );
        this.parentControl().removeEventListener('input', () =>
            this.openDropdown()
        );
    }

    openDialog = signal<DialogRef | undefined>(undefined);
    openDropdown() {
        if (
            this.parentControl().hasAttribute('disabled') &&
            this.parentControl().getAttribute('disabled') !== 'false'
        ) {
            return;
        }
        if (this.openDialog()) {
            return;
        }

        const inputRect = this.parentControl().getBoundingClientRect();

        const ref = this.dialogService.openTemplateDialog(
            this.dropdownTemplate()!,
            {
                top: inputRect.bottom + 'px',
                left: inputRect.left + 'px',
                width: inputRect.width + 'px',
                closeOnEscape: true,
                closeOnBackdropClick: true,
                backdropCss: {
                    pointerEvents: 'none',
                },
            }
        );
         // if the dialog element height is smaller than the dropdown container height, we need to adjust the position because we hit the bottom of the page
         setTimeout(() => {
            const dropdownHeight = document.getElementById(this.dropdownId)!.offsetHeight; // the native height of the dropdown
            if (ref.dialogElement.offsetHeight < dropdownHeight && inputRect.top - dropdownHeight > 0) {
                ref.reposition(args => {
                    args.left = inputRect.left + 'px';
                    args.top = inputRect.top - dropdownHeight + 'px';
                });
            }
        }, 10);
        this.registerKeyNavigation();
        ref.afterClosed$.subscribe(() => {
            this.unregisterKeyNavigation();
            if (this.openDialog() === ref) {
                this.openDialog.set(undefined);
            }
        });
        this.openDialog.set(ref);
    }
    closeDropdown() {
        this.openDialog()?.close();
    }

    highlightedOption = signal<OptionComponent | undefined>(undefined);

    selectValue(option: OptionComponent) {
        this.parentControl().value = option.value();
        this.closeDropdown();
    }

    optionMouseDown(event: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    optionKeyNavSubscription: Subscription | undefined;
    private registerKeyNavigation() {
        this.unregisterKeyNavigation();
        this.optionKeyNavSubscription = fromEvent(document, 'keydown')
            .pipe(map((e) => e as KeyboardEvent))
            .subscribe((e: KeyboardEvent) => {
                this.onKeyDown(e);
            });
    }
    private unregisterKeyNavigation() {
        if (this.optionKeyNavSubscription) {
            this.optionKeyNavSubscription.unsubscribe();
            this.optionKeyNavSubscription = undefined;
        }
    }

    /**
     *
     * @param e Handles KeyDown event for:
     * - host element
     * - global keydown event when dropdown is open
     * @returns
     */
    onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            console.log(this.openDialog)
            // if dropdown is not open
            if (this.openDialog) {
                // if dropdown is open
                // if an option is highlighted, select it
                if (this.highlightedOption()) {
                    this.selectValue(this.highlightedOption()!);
                } else {
                    // if an option is not highlighted, close the dropdown
                    this.openDialog()?.close();
                }
            }
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // if dropdown is open:
            // - we find the currently HIGHLIGHTED option
            // - we find the next option to highlight
            // - if no option is found, we highlight the first/last option
            // if dropdown is NOT open:
            // - if this is a multiselect, ignore
            // - if this is a single select, find the next item to select
            // - if no item is selected, highlight the first/last item

            if (!this.openDialog) {
                return;
            }

            let currentIndex = -1;
            if (this.highlightedOption()) {
                currentIndex = this.options().findIndex(
                    (o) => o.value() === this.highlightedOption()!.value()
                );
            }
            let nextIndex: number;
            // find the next index to highlight/select
            if (e.key === 'ArrowDown') {
                if (currentIndex === -1) {
                    // find the first non disabled option
                    nextIndex = this.options().findIndex((o) => !o.disabled());
                } else {
                    // find the next option that is not disabled
                    nextIndex = this.options().findIndex(
                        (o, i) => i > currentIndex && !o.disabled()
                    );
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = this.options().findIndex(
                            (o, i) => i < currentIndex && !o.disabled()
                        );
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === -1) {
                    // find the last non disabled option
                    nextIndex = this.options()
                        .slice()
                        .reverse()
                        .findIndex((o) => !o.disabled());
                    if (nextIndex !== -1) {
                        nextIndex = this.options().length - nextIndex - 1;
                    }
                } else {
                    const flippedCurrentIndex =
                        this.options().length - currentIndex - 1;
                    // find the next option that is not disabled
                    nextIndex = [...this.options()]
                        .reverse()
                        .findIndex(
                            (o, i) => i > flippedCurrentIndex && !o.disabled()
                        );
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = [...this.options()]
                            .reverse()
                            .findIndex(
                                (o, i) =>
                                    i < flippedCurrentIndex && !o.disabled()
                            );
                    }
                    if (nextIndex !== -1) {
                        nextIndex = this.options().length - nextIndex - 1;
                    }
                }
            } else {
                nextIndex = -1;
            }

            if (nextIndex !== -1) {
                this.highlightedOption.set(this.options()[nextIndex]);
                console.log(
                    document.querySelector(
                        `#${this.dropdownId} .option-wrapper.highlight`
                    )
                );
                setTimeout(
                    () =>
                        document
                            .querySelector(
                                `#${this.dropdownId} .option-wrapper.highlight`
                            )
                            ?.scrollIntoView({
                                block: 'nearest',
                            }),
                    10
                );
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
}
