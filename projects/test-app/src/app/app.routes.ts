import { Routes } from '@angular/router';
import { CheckboxPageComponent } from './checkbox-page/checkbox-page.component';
import { CssPageComponent } from './css-page/css-page.component';
export const routes: Routes = [
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

    }
];
