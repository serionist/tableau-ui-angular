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
import { SelectPageComponent } from './pages/select-page/select-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { LocalDevelopmentComponent } from './pages/local-development/local-development.component';
import { TreePageComponent } from './pages/tree-page/tree-page.component';
import { MenuPageComponent } from './pages/menu-page/menu-page.component';
import { DatePickerPageComponent } from './pages/date-picker-page/date-picker-page.component';
import { ExpansionPageComponent } from './pages/expansion-page/expansion-page.component';
import { ScrollerPageComponent } from './pages/scroller-page/scroller-page.component';
import { TablePageComponent } from './pages/table-page/table-page.component';
export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
        title: 'Home',
        data: {
            page: 'home',
        },
    },
    {
        path: 'local-development',
        component: LocalDevelopmentComponent,
        title: 'local-development',
        data: {
            page: 'local-development',
        },
    },
    {
        path: 'checkbox',
        component: CheckboxPageComponent,
        title: 'Checkboxes',
        data: {
            page: 'checkbox',
        },
    },
    {
        path: 'table',
        component: TablePageComponent,
        title: 'Tables',
        data: {
            page: 'table',
        },
    },
    {
        path: 'select',
        component: SelectPageComponent,
        title: 'Select',
        data: {
            page: 'select',
        },
    },
    {
        path: 'list',
        component: ListPageComponent,
        title: 'List',
        data: {
            page: 'list',
        },
    },
    {
        path: 'css',
        component: CssPageComponent,
        title: 'CSS & Fonts',
        data: {
            page: 'css',
        },
    },
    {
        path: 'icons',
        component: IconsPageComponent,
        title: 'Icons',
        data: {
            page: 'icons',
        },
    },
    {
        path: 'buttons',
        component: ButtonsPageComponent,
        title: 'Buttons',
        data: {
            page: 'buttons',
        },
    },
    {
        path: 'dialogs',
        component: DialogsPageComponent,
        title: 'Dialogs',
        data: {
            page: 'dialogs',
        },
    },
    {
        path: 'expansion-panel',
        component: ExpansionPageComponent,
        title: 'Expansion Panels',
        data: {
            page: 'expansion-panel',
        },
    },
    {
        path: 'snackbar',
        component: SnacksPageComponent,
        title: 'Snackbar',
        data: {
            page: 'snackbar',
        },
    },
    {
        path: 'tooltips',
        component: TooltipsPageComponent,
        title: 'Tooltips',
        data: {
            page: 'tooltips',
        },
    },
    {
        path: 'tabcontrol',
        component: TabcontrolPageComponent,
        title: 'Tabs',
        data: {
            page: 'tabcontrol',
        },
    },
    {
        path: 'navbar',
        component: NavbarPageComponent,
        title: 'Nav Bar',
        data: {
            page: 'navbar',
        },
    },
    {
        path: 'menu',
        component: MenuPageComponent,
        title: 'Menu',
        data: {
            page: 'menu',
        },
    },
    {
        path: 'date-picker',
        component: DatePickerPageComponent,
        title: 'Date Picker',
        data: {
            page: 'date-picker',
        },
    },
    {
        path: 'tree',
        component: TreePageComponent,
        title: 'Tree',
        data: {
            page: 'tree',
        },
    },
    {
        path: 'clipboard',
        component: ClipboardPageComponent,
        title: 'Clipboard',
        data: {
            page: 'clipboard',
        },
    },
    {
        path: 'form-fields',
        component: FormFieldsPageComponent,
        title: 'Form Fields',
        data: {
            page: 'form-fields',
        },
    },
    {
        path: 'radios',
        component: RadioButtonsPageComponent,
        title: 'Radio Buttons',
        data: {
            page: 'radios',
        },
    },
    {
        path: 'scroller',
        component: ScrollerPageComponent,
        title: 'Arrow Scroller',
        data: {
            page: 'scroller',
        },
    },
];
