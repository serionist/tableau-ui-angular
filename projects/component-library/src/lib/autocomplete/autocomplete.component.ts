import { ChangeDetectionStrategy, Component, contentChild, contentChildren, Directive, ElementRef, inject, input, model, OnDestroy, OnInit, Signal, signal, TemplateRef, viewChild, WritableSignal } from '@angular/core';
import { IOptionGridContext, OptionComponent } from '../common/option';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';
import { DialogService } from '../dialogservice/dialog.service';
import { DialogRef } from '../dialogservice/dialog.ref';
import { fromEvent, map, Subject, Subscription } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { generateRandomString } from '../utils';

@Component({
    selector: 'tab-autocomplete',
    standalone: false,
    templateUrl: './autocomplete.component.html',
    styleUrl: './autocomplete.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoCompleteComponent {
    private readonly dialogService = inject(DialogService);
    private readonly elementRef = inject(ElementRef);

    protected readonly dropdownId: string;

    public readonly selectValue$ = new Subject<OptionComponent>();
    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    readonly $dropdownContainerCss = model<Record<string, string>>(
        {},
        {
            alias: 'dropdownContainerCss',
        },
    );
    /**
     * The CSS text to apply to the options container in the dropdown
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown
     * This is applied to the options container, excluding the prefix & suffix
     *
     * @default "{ maxHeight: '300px', height: 'fit-content'}"
     */
    readonly $dropdownOptionsContainerCss = model<Record<string, string>>(
        {
            maxHeight: '300px',
            height: 'fit-content',
        },
        {
            alias: 'dropdownOptionsContainerCss',
        },
    );
    /**
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    readonly $dropdownValueTemplateContext = model<IOptionGridContext>(
        {
            renderIcon: true,
            renderText: true,
            renderHint: true,
        },
        {
            alias: 'dropdownValueTemplateContext',
        },
    );

    protected readonly $options = contentChildren<OptionComponent>(OptionComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $dropdownPrefix: Signal<PrefixComponent | undefined> = contentChild<PrefixComponent>(PrefixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $dropdownSuffix: Signal<SuffixComponent | undefined> = contentChild<SuffixComponent>(SuffixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $dropdownTemplate: Signal<TemplateRef<any> | undefined> = viewChild<TemplateRef<any>>('dropdownTemplate');

    constructor() {
        const id = generateRandomString();
        this.dropdownId = `dropdown-${id}`;
        toObservable(this.$options).subscribe((options) => {
            this.$highlightedOption.set(undefined);
        });
    }

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    private readonly $openDialog: WritableSignal<{ ref: DialogRef; el: HTMLInputElement } | undefined> = signal<{ ref: DialogRef; el: HTMLInputElement } | undefined>(undefined);
    openDropdown(parentControl: HTMLInputElement) {
        if (parentControl.hasAttribute('disabled') && parentControl.getAttribute('disabled') !== 'false') {
            return undefined;
        }
        if (this.$openDialog()) {
            if (this.$openDialog()?.el === parentControl) {
                return this.$openDialog()?.ref;
            }
            this.$openDialog()?.ref.close();
        }

        const inputRect = parentControl.getBoundingClientRect();

        const ref = this.dialogService.openTemplateDialog(
            this.$dropdownTemplate()!,
            {
                //top: inputRect.bottom + 'px',
                top(actualWidth, actualHeight) {
                    if (inputRect.bottom + actualHeight > window.innerHeight && inputRect.top - actualHeight > 0) {
                        return inputRect.top - actualHeight + 'px';
                    }
                    return inputRect.bottom + 'px';
                },
                left: inputRect.left + 'px',
                width: inputRect.width + 'px',
                closeOnEscape: true,
                closeOnBackdropClick: true,
                backdropCss: {
                    pointerEvents: 'none',
                },
            },
            null,
            parentControl,
        );

        this.registerKeyNavigation();
        ref.closed$.subscribe(() => {
            this.unregisterKeyNavigation();
            if (this.$openDialog()?.ref === ref) {
                this.$openDialog.set(undefined);
            }
        });
        this.$openDialog.set({ ref, el: parentControl });
        return ref;
    }
    closeDropdown() {
        this.$openDialog()?.ref.close();
    }

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $highlightedOption: WritableSignal<OptionComponent | undefined> = signal<OptionComponent | undefined>(undefined);

    protected optionMouseDown(event: MouseEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private optionKeyNavSubscription: Subscription | undefined;
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
    private onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            // if dropdown is not open
            if (this.$openDialog()) {
                // if dropdown is open
                // if an option is highlighted, select it
                if (this.$highlightedOption()) {
                    this.selectValue$.next(this.$highlightedOption()!);
                } else {
                    // if an option is not highlighted, close the dropdown
                    this.$openDialog()?.ref.close();
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

            if (!this.$openDialog()) {
                return;
            }

            let currentIndex = -1;
            if (this.$highlightedOption()) {
                currentIndex = this.$options().findIndex((o) => o.$value() === this.$highlightedOption()!.$value());
            }
            let nextIndex: number;
            // find the next index to highlight/select
            if (e.key === 'ArrowDown') {
                if (currentIndex === -1) {
                    // find the first non disabled option
                    nextIndex = this.$options().findIndex((o) => !o.$disabled());
                } else {
                    // find the next option that is not disabled
                    nextIndex = this.$options().findIndex((o, i) => i > currentIndex && !o.$disabled());
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = this.$options().findIndex((o, i) => i < currentIndex && !o.$disabled());
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === -1) {
                    // find the last non disabled option
                    nextIndex = this.$options()
                        .slice()
                        .reverse()
                        .findIndex((o) => !o.$disabled());
                    if (nextIndex !== -1) {
                        nextIndex = this.$options().length - nextIndex - 1;
                    }
                } else {
                    const flippedCurrentIndex = this.$options().length - currentIndex - 1;
                    // find the next option that is not disabled
                    nextIndex = [...this.$options()].reverse().findIndex((o, i) => i > flippedCurrentIndex && !o.$disabled());
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = [...this.$options()].reverse().findIndex((o, i) => i < flippedCurrentIndex && !o.$disabled());
                    }
                    if (nextIndex !== -1) {
                        nextIndex = this.$options().length - nextIndex - 1;
                    }
                }
            } else {
                nextIndex = -1;
            }

            if (nextIndex !== -1) {
                this.$highlightedOption.set(this.$options()[nextIndex]);

                setTimeout(
                    () =>
                        document.querySelector(`#${this.dropdownId} .option-wrapper.highlight`)?.scrollIntoView({
                            block: 'nearest',
                        }),
                    10,
                );
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
}
