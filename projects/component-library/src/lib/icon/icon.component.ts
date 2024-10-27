import {
    Component,
    ContentChild,
    ElementRef,
    AfterContentInit,
    Input,
    input,
    contentChild,
    inject,
    ViewChild,
    AfterViewInit,
    OnInit,
    model,
    computed,
} from '@angular/core';
import { IconService } from './icon.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
@Component({
    selector: 'tab-icon',
    template: `
        @if (showIcon | async) {
            {{ value() }}
        }
    `,
    host: {
        role: 'img',
        'class': 'tab-icon',
        '[class.error]': "color() === 'error'",
        '[class.primary]': "color() === 'primary'",
        '[class.success]': "color() === 'success'",
    },
    styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnInit {
    value = model<string>();
    color = model<'primary' | 'error' | 'success' | undefined>();

    iconService = inject(IconService);

    showIcon = combineLatest([toObservable(this.value), this.iconService.loadedIcons]).pipe(
        map(([value, icons]) => {
            if (!value) {
                return false;
            }
            if (!this.iconService.dynamicEnabled) {
                return true;
            }
            return icons.has(value);
        })
    )

    ngOnInit(): void {
        this.addIconToService(this.value());
        this.value.subscribe((v) => {
            this.addIconToService(v);
        });
    }
    addIconToService(value: string | undefined) {
        if (value === undefined) {
            return;
        }
        this.iconService.addIcon(value);
    }
}
