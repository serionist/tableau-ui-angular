import { Component, input } from "@angular/core";

@Component({
    template: '<ng-content></ng-content>',
    standalone: true,
    selector: 'tab-icon',
    host: {
        'role': 'img',
        'class': 'tab-icon',
        '[class]': 'color()'
    },
    styleUrls: ['./icon.component.scss']
})
export class IconComponent {
    color = input<'primary' | 'error' | undefined>();
    
}