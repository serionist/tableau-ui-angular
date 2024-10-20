import { CommonModule } from "@angular/common";
import { Component, TemplateRef, ViewChild, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'tab-tooltip',
    standalone: true,
    imports: [CommonModule],
    template: `<ng-template #tooltipTemplate>
        <div class="tooltip-content">
            <ng-content></ng-content>
        </div>
    </ng-template>`,
    styleUrls: ['tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipComponent {
    @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate!: TemplateRef<any>;
}
