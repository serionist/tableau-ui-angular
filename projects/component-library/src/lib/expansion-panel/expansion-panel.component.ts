import {
    ChangeDetectionStrategy,
    Component,
    contentChild,
    inject,
    input,
    model,
    OnDestroy,
    OnInit,
    Signal,
    viewChild,
} from '@angular/core';
import {
    ExpansionPanelTitleCollapsedContent,
    ExpansionPanelTitleExpandedContent,
} from './expansion-panel-title.component';
import { generateRandomString } from '../utils';
import { AccordionComponent } from './accordion.component';
import { AccordionRegistry } from './accordion.registry';
import { toObservable } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
    selector: 'tab-expansion-panel',
    templateUrl: './expansion-panel.component.html',
    styleUrls: ['./expansion-panel.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.expanded]': 'expanded() ? true : null',
        '[attr.disabled]': 'disabled() ? true : null',
    },
})
export class ExpansionPanelComponent implements OnInit, OnDestroy {
    readonly id = generateRandomString(16);
    /**
     * The expanded state of the panel.
     * @default false
     */
    expanded = model<boolean>(false);
    expandedChange$ = toObservable(this.expanded).pipe(
        startWith(this.expanded())
    );
    /**
     * The disabled state of the panel.
     * @default false
     */
    disabled = input<boolean>(false);
    /**
     * Disables the hover color of the header
     */
    noHeaderHover = input<boolean>(false);

    protected expandedHeader: Signal<
        ExpansionPanelTitleExpandedContent | undefined
    > = contentChild(ExpansionPanelTitleExpandedContent);
    protected collapsedHeader: Signal<
        ExpansionPanelTitleCollapsedContent | undefined
    > = contentChild(ExpansionPanelTitleCollapsedContent);

    private accordion = inject(AccordionComponent, {
        skipSelf: true,
        optional: true,
    });

    public registry = input<AccordionRegistry>();

    ngOnInit(): void {
        const registry = this.registry() ?? this.accordion?.registry;
        registry?.register(this);
    }
    ngOnDestroy(): void {
        const registry = this.registry() ?? this.accordion?.registry;
        registry?.unregister(this);
    }

    setExpanded(expanded: boolean) {
        if (this.disabled()) {
            return;
        }
        this.expanded.set(expanded);
    }
}
