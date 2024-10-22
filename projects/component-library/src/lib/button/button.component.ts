import { CommonModule } from '@angular/common';
import { Component, input, output, signal, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,  // Disable view encapsulation
  host: {
    '[attr.type]': 'type()',
    '[class]': 'color()',
    '[attr.disabled]': 'disabled() || loading() ? true : null',
    '[class.loading]': 'loading()',
    'tabindex': '0',
    'role': 'button'
  }
})
export class ButtonComponent {
  disabled = input(false);
  loading = input(false);
  type = input<'submit' | 'button'>('button');
  color = input<'primary' | 'secondary' | 'error'>('secondary');
 
}
