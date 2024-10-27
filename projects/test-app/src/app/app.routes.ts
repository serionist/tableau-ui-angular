import { Routes } from '@angular/router';
import { CheckboxPageComponent } from './pages/checkbox-page/checkbox-page.component';
import { CssPageComponent } from './pages/css-page/css-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { FormFieldsPageComponent } from './pages/form-fields-page/form-fields-page.component';
import { RadioButtonsPageComponent } from './pages/radio-buttons-page/radio-buttons-page.component';
import { IconsPageComponent } from './pages/icons-page/icons-page.component';
import { ButtonsPageComponent } from './pages/buttons-page/buttons-page.component';
import { DialogsPageComponent } from './pages/dialogs-page/dialogs-page.component';
import { SnacksPageComponent } from './pages/snacks-page/snacks-page.component';
import { TooltipsPageComponent } from './pages/tooltips-page/tooltips-page.component';
import { TabcontrolPageComponent } from './pages/tabcontrol-page/tabcontrol-page.component';
import { NavbarPageComponent } from './pages/navbar-page/navbar-page.component';
import { ClipboardPageComponent } from './pages/clipboard-page/clipboard-page.component';
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
        path: 'buttons',
        component: ButtonsPageComponent,
        title: 'Buttons',
        data: {
            page: 'buttons'
        }

    },
    {
        path: 'dialogs',
        component: DialogsPageComponent,
        title: 'Dialogs',
        data: {
            page: 'dialogs'
        }

    },
    {
        path: 'snackbar',
        component: SnacksPageComponent,
        title: 'Snackbar',
        data: {
            page: 'snackbar'
        }

    },
    {
        path: 'tooltips',
        component: TooltipsPageComponent,
        title: 'Tooltips',
        data: {
            page: 'tooltips'
        }

    },
    {
        path: 'tabcontrol',
        component: TabcontrolPageComponent,
        title: 'Tabs',
        data: {
            page: 'tabcontrol'
        }

    },
    {
        path: 'navbar',
        component: NavbarPageComponent,
        title: 'Nav Bar',
        data: {
            page: 'navbar'
        }

    },
    {
        path: 'clipboard',
        component: ClipboardPageComponent,
        title: 'Clipboard',
        data: {
            page: 'clipboard'
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
