import { Component, inject, OnInit } from '@angular/core';
import { SnackService } from '../../../../../component-library/src/public-api';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-radio-buttons-page',
  templateUrl: './radio-buttons-page.component.html',
  styleUrl: './radio-buttons-page.component.scss'
})
export class RadioButtonsPageComponent implements OnInit{
  
  snackService = inject(SnackService);
  simpleValue = 1;

  formControl = new FormControl<number | null>(null, [Validators.required, Validators.min(2), Validators.max(3)]);

  valueChanged(value: any, name: string, type: 'info' | 'error' = 'info') {
    console.log(`Value changed for ${name}:`, value);
    this.snackService.openSnack(`${name} set to: ${value}`, 3000, type);
  }
  ngOnInit(): void {
    this.formControl.markAllAsTouched();
    this.formControl.updateValueAndValidity();
    this.formControl.valueChanges.subscribe((value) => { this.valueChanged(value, 'Form Control', this.formControl.invalid ? 'error': 'info'); });
  }

}
