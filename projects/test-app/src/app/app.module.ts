import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {
    ICON_CONFIG,
    TableauUiButtonModule,
    TableauUiCheckboxModule,
    TableauUiCommonModule,
    TableauUiDialogModule,
    TableauUiFormFieldModule,
    TableauUiIconModule,
    TableauUiNavBarModule,
    TableauUiRadioGroupModule,
    TableauUiSnackModule,
    TableauUiTooltipModule,
} from '../../../component-library/src/public-api';
import { provideRouter, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CssPageComponent } from './pages/css-page/css-page.component';
import { CheckboxPageComponent } from './pages/checkbox-page/checkbox-page.component';
import { routes } from './app.routes';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { FormFieldsPageComponent } from './pages/form-fields-page/form-fields-page.component';
import { RadioButtonsPageComponent } from './pages/radio-buttons-page/radio-buttons-page.component';
import { IconsPageComponent } from './pages/icons-page/icons-page.component';
import { ButtonsPageComponent } from './pages/buttons-page/buttons-page.component';
import { DialogsPageComponent } from './pages/dialogs-page/dialogs-page.component';
import { ExampleDialogComponent } from './pages/dialogs-page/example-dialog.component';
import { SnacksPageComponent } from './pages/snacks-page/snacks-page.component';
import { ExampleSnackComponent } from './pages/snacks-page/example-snack.component';
import { TooltipsPageComponent } from './pages/tooltips-page/tooltips-page.component';

@NgModule({
    declarations: [
        AppComponent,
        CssPageComponent,
        CheckboxPageComponent,
        HomePageComponent,
        FormFieldsPageComponent,
        RadioButtonsPageComponent,
        IconsPageComponent,
        ButtonsPageComponent,
        DialogsPageComponent,
        ExampleDialogComponent,
        SnacksPageComponent,
        ExampleSnackComponent,
        TooltipsPageComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        MonacoEditorModule.forRoot(),
        RouterModule,
        ReactiveFormsModule,
        TableauUiNavBarModule,
        TableauUiCommonModule,
        TableauUiCheckboxModule,
        TableauUiSnackModule,
        TableauUiFormFieldModule,
        TableauUiIconModule.forRoot({ enableDynamicIcons: true, enableDynamicIconsLocalStorageCache: true }),
        TableauUiRadioGroupModule,
        TableauUiButtonModule,
        TableauUiDialogModule,
        TableauUiTooltipModule
    ],
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        // Add this provider to enable dynamic icons if you don't use the TableauUiIconModule.forRoot() method in your app.module.ts
        // {
        //     provide: ICON_CONFIG,
        //     useValue: {
        //         enableDynamicIcons: true,
        //         enableDynamicIconsLocalStorageCache: true
        //     }
        // }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
