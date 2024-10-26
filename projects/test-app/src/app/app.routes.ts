import { Routes } from '@angular/router';
import { CheckboxPageComponent } from './pages/checkbox-page/checkbox-page.component';
import { CssPageComponent } from './pages/css-page/css-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
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

    }
];
