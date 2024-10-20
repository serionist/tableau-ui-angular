import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from 'component-library';
import { FormControl } from '@angular/forms';
import { TabGroupComponent, TabComponent, CheckboxComponent, FormFieldComponent, FormLabelComponent, FormErrorComponent, FormHintComponent, FormSuffixComponent, FormPrefixComponent } from '../../../component-library/src/public-api';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, TabGroupComponent, TabComponent,
    CheckboxComponent, ReactiveFormsModule, 
    FormFieldComponent, FormLabelComponent, FormErrorComponent, FormHintComponent, FormSuffixComponent, FormPrefixComponent
  ],
  

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.errorControl.markAsTouched();
    this.errorControl.updateValueAndValidity();
  }
  title = 'test-app';


  checkboxControl1 = new FormControl(false);
  checkboxControl2 = new FormControl({ value: true, disabled: true });
  checkboxControl3 = new FormControl(true);
  errorControl = new FormControl('lofasz', Validators.pattern(/^\d+$/));


}
