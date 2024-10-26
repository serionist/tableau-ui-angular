import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {
    TableauUiCommonModule,
    TableauUiNavBarModule,
} from '../../../component-library/src/public-api';
import { provideRouter, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CssPageComponent } from './pages/css-page/css-page.component';
import { CheckboxPageComponent } from './pages/checkbox-page/checkbox-page.component';
import { routes } from './app.routes';
import { HomePageComponent } from './pages/home-page/home-page.component';

@NgModule({
    declarations: [AppComponent, CssPageComponent, CheckboxPageComponent, HomePageComponent],
    imports: [
        BrowserModule,
        FormsModule,
        MonacoEditorModule.forRoot(),
        RouterModule,
        TableauUiNavBarModule,
        TableauUiCommonModule,
        CommonModule,
    ],
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
