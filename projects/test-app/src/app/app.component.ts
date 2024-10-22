import { Component, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    DialogService,
    LoaderComponent
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
        IconComponent,
    ],

    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    public dialogService = inject(DialogService);
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
        warning: false,
    };
    async buttonClick(color: 'primary' | 'secondary' | 'warning') {
        this.buttonsLoading[color] = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
    }
    openDialog(): void {
        const dialogRef = this.dialogService.openModal(
            ExampleDialogComponent,
            { message: 'This is a dynamic message!' },
            {
                width: 'calc(100vw - 100px)',
                height: 'fit-content',
                closeOnBackdropClick: true,
                maxWidth: '300px',
                header: {
                    allowClose: true,
                    title: 'This is a dynamic title!',
                },
            }
        );

        dialogRef.afterClosed$.subscribe((result) => {
            console.log('Dialog closed with result:', result);
        });
    }

    async openConfirmationDialog(
        color: 'primary' | 'error' | 'secondary' = 'secondary',
        autofocus?: 'accept' | 'cancel' | undefined,
        acceptBtnText?: string | undefined,
        cancelBtnText?: string | undefined
    ) {
        const dialogRef =
            await this.dialogService.openConfirmationMessageDialog(
                'This a random confirmation dialog',
                'Are you sure you want to delete this item? This stuff must be two lines long so I generate some random text.',
                color,
                acceptBtnText,
                cancelBtnText,
                autofocus
            );
        console.log('Confirmation dialog returned: ', dialogRef);
    }
    async openConfirmationTemplateDialog(
      template: TemplateRef<any>,
      color: 'primary' | 'error' | 'secondary' = 'secondary',
      autofocus: 'accept' | 'cancel' | undefined,
      acceptBtnText?: string | undefined,
      cancelBtnText?: string | undefined
  ) {
      const dialogRef =
          await this.dialogService.openConfirmationTemplateDialog(
              'This a random confirmation dialog',
              template,
              color,
              acceptBtnText,
              cancelBtnText,
              autofocus,
              {
                width: '500px'
              }
          );
      console.log('Confirmation dialog returned: ', dialogRef);
  }
}
