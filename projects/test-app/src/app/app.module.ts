import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {
    TableauUiButtonModule,
    TableauUiCheckboxModule,
    TableauUiClipboardModule,
    TableauUiCommonModule,
    TableauUiDialogModule,
    TableauUiFormFieldModule,
    TableauUiIconModule,
    TableauUiNavBarModule,
    TableauUiRadioGroupModule,
    TableauUiSnackModule,
    TableauUiTabgroupModule,
    TableauUiTooltipModule,
    TableauUiSelectModule,
    TableauUiListModule
} from '../../../component-library/src/public-api';
import { provideRouter, RouterModule, RouterOutlet, withHashLocation } from '@angular/router';
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
import { TabcontrolPageComponent } from './pages/tabcontrol-page/tabcontrol-page.component';
import { NavbarPageComponent } from './pages/navbar-page/navbar-page.component';
import { ClipboardPageComponent } from './pages/clipboard-page/clipboard-page.component';
import { SelectPageComponent } from './pages/select-page/select-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { LocalDevelopmentComponent } from './pages/local-development/local-development.component';

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
        TooltipsPageComponent,
        TabcontrolPageComponent,
        NavbarPageComponent,
        ClipboardPageComponent,
        SelectPageComponent,
        ListPageComponent,
        LocalDevelopmentComponent
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
        TableauUiIconModule,
        TableauUiRadioGroupModule,
        TableauUiButtonModule,
        TableauUiDialogModule,
        TableauUiTooltipModule,
        TableauUiTabgroupModule,
        TableauUiClipboardModule,
        TableauUiSelectModule,
        TableauUiListModule
    ],
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withHashLocation())
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
