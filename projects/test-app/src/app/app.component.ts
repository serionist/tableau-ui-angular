import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from 'component-library';
import { FormControl } from '@angular/forms';
import {
    TabGroupComponent,
    TabComponent,
    CheckboxComponent,
    FormFieldComponent,
    FormLabelComponent,
    ErrorComponent,
    HintComponent,
    FormSuffixComponent,
    FormPrefixComponent,
    OptionComponent,
    RadiogroupComponent,
    TooltipComponent,
    TooltipDirective,
    ButtonComponent
} from '../../../component-library/src/public-api';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        LoaderComponent,
        TabGroupComponent,
        TabComponent,
        CheckboxComponent,
        ReactiveFormsModule,
        FormFieldComponent,
        FormLabelComponent,
        ErrorComponent,
        HintComponent,
        FormSuffixComponent,
        FormPrefixComponent,
        RadiogroupComponent,
        OptionComponent,
        TooltipComponent,
        TooltipDirective,
        ButtonComponent
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

    simpleControl = new FormControl(false);
    disabledControl = new FormControl({ value: true, disabled: true });
    errorControl = new FormControl('lofasz', Validators.pattern(/^\d+$/));


    buttonsLoading = {
        primary: false,
        secondary: false,
        warning: false
    }
    async buttonClick(color: 'primary' | 'secondary' | 'warning') {
      this.buttonsLoading[color] = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
    }

  }
