import { Routes } from '@angular/router';
import { CheckboxPageComponent } from './pages/checkbox-page/checkbox-page.component';
import { CssPageComponent } from './pages/css-page/css-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { FormFieldsPageComponent } from './pages/form-fields-page/form-fields-page.component';
import { RadioButtonsPageComponent } from './pages/radio-buttons-page/radio-buttons-page.component';
import { IconsPageComponent } from './pages/icons-page/icons-page.component';
export const routes: Routes = [
    {
        'path': '',
        component: HomePageComponent,
        title: 'Home',
        data: {
            page: 'home'
        }
    },
    {
        path: 'checkbox',
        component: CheckboxPageComponent,
        title: 'Checkboxes',
        data: {
            page: 'checkbox'
        }

    },
    {
        path: 'css',
        component: CssPageComponent,
        title: 'CSS & Fonts',
        data: {
            page: 'css'
        }

    },
    {
        path: 'icons',
        component: IconsPageComponent,
        title: 'Icons',
        data: {
            page: 'icons'
        }

    },
    {
        path: 'form-fields',
        component: FormFieldsPageComponent,
        title: 'Form Fields',
        data: {
            page: 'form-fields'
        }
    },
    {
        path: 'radios',
        component: RadioButtonsPageComponent,
        title: 'Radio Buttons',
        data: {
            page: 'radios'
        }
    },
];
