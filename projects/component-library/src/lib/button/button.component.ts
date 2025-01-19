import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'button,a[button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    // encapsulation: ViewEncapsulation.None, // Disable view encapsulation
    host: {
        '[attr.type]': 'type()',
        '[class]': 'color()',
        '[attr.disabled]': 'disabled() || loading() ? true : null',
        '[class.loading]': 'loading()',
        '[attr.tabindex]': 'disabled() ? "-1": tabindex()',
        'role': 'button'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ButtonComponent {
  nativeElement = inject(ElementRef);
  disabled = input(false);
  loading = input(false);
  tabindex = input('0');
  type = input<'submit' | 'button'>('button');
  color = input<'primary' | 'secondary' | 'error' | 'plain'>('secondary');
  
 
}
