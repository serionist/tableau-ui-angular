import { Component, OnInit, ViewContainerRef } from '@angular/core';
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
    ButtonComponent,
    IconComponent,
    DialogService
} from '../../../component-library/src/public-api';
import { ExampleDialogComponent } from './example-dialog.component';

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
        ButtonComponent,
        IconComponent
    ],

    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private dialogService: DialogService) {}
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
    openDialog(): void {
      const dialogRef = this.dialogService.openModal(ExampleDialogComponent, { message: 'This is a dynamic message!' }, {
        width: 'calc(100vw - 100px)',
        height: 'fit-content',
        closeOnBackdropClick: true,
        maxWidth: '300px',
        header: {
          allowClose: true,
          title: 'This is a dynamic title!'
        }
      });
  
      dialogRef.afterClosed$.subscribe((result) => {
        console.log('Dialog closed with result:', result);
      });
    }

  }
