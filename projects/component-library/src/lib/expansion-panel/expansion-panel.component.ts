import type { OnDestroy, OnInit, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, inject, input, model, viewChild } from '@angular/core';
import { ExpansionPanelTitleCollapsedContentDirective, ExpansionPanelTitleExpandedContentDirective } from './expansion-panel-title.component';
import { generateRandomString } from '../utils';
import { AccordionComponent } from './accordion.component';
import type { AccordionRegistry } from './accordion.registry';
import { toObservable } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
    selector: 'tab-expansion-panel',
    standalone: false,
    templateUrl: './expansion-panel.component.html',
    styleUrl: './expansion-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.expanded]': '$expanded() ? true : null',
        '[attr.disabled]': '$disabled() ? true : null',
    },
})
export class ExpansionPanelComponent implements OnInit, OnDestroy {
    readonly id = generateRandomString(16);
    /**
     * The expanded state of the panel.
     * @default false
     */
    readonly $expanded = model<boolean>(false, {
        alias: 'expanded',
    });
    readonly expandedChange$ = toObservable(this.$expanded).pipe(startWith(this.$expanded()));
    /**
     * The disabled state of the panel.
     * @default false
     */
    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });
    /**
     * Disables the hover color of the header
     */
    readonly $noHeaderHover = input<boolean>(false, {
        alias: 'noHeaderHover',
    });

    protected readonly $expandedHeader: Signal<ExpansionPanelTitleExpandedContentDirective | undefined> = contentChild(ExpansionPanelTitleExpandedContentDirective);
    protected readonly $collapsedHeader: Signal<ExpansionPanelTitleCollapsedContentDirective | undefined> = contentChild(ExpansionPanelTitleCollapsedContentDirective);

    private readonly accordion = inject(AccordionComponent, {
        skipSelf: true,
        optional: true,
    });

    public readonly $registry = input<AccordionRegistry>(undefined, {
        alias: 'registry',
    });

    ngOnInit(): void {
        const registry = this.$registry() ?? this.accordion?.registry;
        registry?.register(this);
    }
    ngOnDestroy(): void {
        const registry = this.$registry() ?? this.accordion?.registry;
        registry?.unregister(this);
    }

    protected setExpanded(expanded: boolean) {
        if (this.$disabled()) {
            return;
        }
        this.$expanded.set(expanded);
    }
    protected onclick() {
        if (this.$disabled()) {
            return;
        }
        this.setExpanded(!this.$expanded());
    }
}
