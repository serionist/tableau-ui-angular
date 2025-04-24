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
    ChangeDetectionStrategy,
    InputSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
@Component({
    selector: 'tab-icon',
    template: `{{ value() }}`,
    host: {
        role: 'img',
        'class': 'tab-icon',
        '[class.error]': "color() === 'error'",
        '[class.primary]': "color() === 'primary'",
        '[class.success]': "color() === 'success'",
        '[style.font-family]': "type()",
        '[style.font-variation-settings]': "fontVariationSettings()",
    },
    styleUrls: ['./icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IconComponent {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    value: InputSignal<string | undefined> = input<string>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    color: InputSignal<'primary' | 'error' | 'success' | 'none' | null | undefined> = input<'primary' | 'error' | 'success' | 'none' | null>();

    type = input<'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp'>('Material Symbols Rounded');
    fill = input<boolean>(false);
    weight = input<100 | 200 | 300 | 400 | 500 | 600 | 700>(400);
    grade = input<-25 | 0 | 200>(0);
    opticalSizePx = input<20 | 24 | 40 | 48>(24);

    fontVariationSettings = computed(() => {
        return `'FILL' ${this.fill() ? 1 : 0}, 'wght' ${this.weight()}, 'GRAD' ${this.grade()}, 'opsz' ${this.opticalSizePx()}`;
    });


}
