import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'tab-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  disabled = input(false);
  loading = input(false);
  type = input<'submit' | 'button'>('button');
  color = input<'primary' | 'secondary' | 'warning'>('secondary');
 
}
