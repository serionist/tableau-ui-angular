import type { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent),
    title: 'Home',
    data: {
      page: 'home',
    },
  },
  {
    path: 'local-development',
    loadComponent: async () => import('./pages/local-development/local-development.component').then(m => m.LocalDevelopmentComponent),

    title: 'local-development',
    data: {
      page: 'local-development',
    },
  },
  {
    path: 'checkbox',
    loadComponent: async () => import('./pages/checkbox-page/checkbox-page.component').then(m => m.CheckboxPageComponent),
    title: 'Checkboxes',
    data: {
      page: 'checkbox',
    },
  },
  {
    path: 'stepper',
    loadComponent: async () => import('./pages/stepper-page/stepper-page.component').then(m => m.StepperPageComponent),
    title: 'Stepper',
    data: {
      page: 'stepper',
    },
  },
  {
    path: 'monaco',
    loadComponent: async () => import('./pages/monaco-page/monaco-page.component').then(m => m.MonacoPageComponent),
    title: 'Monaco Editor',
    data: {
      page: 'monaco',
    },
  },
  {
    path: 'drawer',
    loadComponent: async () => import('./pages/drawer-page/drawer-page.component').then(m => m.DrawerPageComponent),
    title: 'Drawer',
    data: {
      page: 'drawer',
    },
  },
  {
    path: 'table',
    loadComponent: async () => import('./pages/table-page/table-page.component').then(m => m.TablePageComponent),
    title: 'Tables',
    data: {
      page: 'table',
    },
  },
  {
    path: 'select',
    loadComponent: async () => import('./pages/select-page/select-page.component').then(m => m.SelectPageComponent),
    title: 'Select',
    data: {
      page: 'select',
    },
  },
  {
    path: 'list',
    loadComponent: async () => import('./pages/list-page/list-page.component').then(m => m.ListPageComponent),
    title: 'List',
    data: {
      page: 'list',
    },
  },
  {
    path: 'css',
    loadComponent: async () => import('./pages/css-page/css-page.component').then(m => m.CssPageComponent),
    title: 'CSS & Fonts',
    data: {
      page: 'css',
    },
  },
  {
    path: 'icons',
    loadComponent: async () => import('./pages/icons-page/icons-page.component').then(m => m.IconsPageComponent),
    title: 'Icons',
    data: {
      page: 'icons',
    },
  },
  {
    path: 'buttons',
    loadComponent: async () => import('./pages/buttons-page/buttons-page.component').then(m => m.ButtonsPageComponent),
    title: 'Buttons',
    data: {
      page: 'buttons',
    },
  },
  {
    path: 'dialogs',
    loadComponent: async () => import('./pages/dialogs-page/dialogs-page.component').then(m => m.DialogsPageComponent),
    title: 'Dialogs',
    data: {
      page: 'dialogs',
    },
  },
  {
    path: 'expansion-panel',
    loadComponent: async () => import('./pages/expansion-page/expansion-page.component').then(m => m.ExpansionPageComponent),
    title: 'Expansion Panels',
    data: {
      page: 'expansion-panel',
    },
  },
  {
    path: 'snackbar',
    loadComponent: async () => import('./pages/snacks-page/snacks-page.component').then(m => m.SnacksPageComponent),
    title: 'Snackbar',
    data: {
      page: 'snackbar',
    },
  },
  {
    path: 'tooltips',
    loadComponent: async () => import('./pages/tooltips-page/tooltips-page.component').then(m => m.TooltipsPageComponent),
    title: 'Tooltips',
    data: {
      page: 'tooltips',
    },
  },
  {
    path: 'tabcontrol',
    loadComponent: async () => import('./pages/tabcontrol-page/tabcontrol-page.component').then(m => m.TabcontrolPageComponent),
    title: 'Tabs',
    data: {
      page: 'tabcontrol',
    },
  },
  {
    path: 'navbar',
    loadComponent: async () => import('./pages/navbar-page/navbar-page.component').then(m => m.NavbarPageComponent),
    title: 'Nav Bar',
    data: {
      page: 'navbar',
    },
  },
  {
    path: 'menu',
    loadComponent: async () => import('./pages/menu-page/menu-page.component').then(m => m.MenuPageComponent),
    title: 'Menu',
    data: {
      page: 'menu',
    },
  },
  {
    path: 'date-picker',
    loadComponent: async () => import('./pages/date-picker-page/date-picker-page.component').then(m => m.DatePickerPageComponent),
    title: 'Date Picker',
    data: {
      page: 'date-picker',
    },
  },
  {
    path: 'tree',
    loadComponent: async () => import('./pages/tree-page/tree-page.component').then(m => m.TreePageComponent),
    title: 'Tree',
    data: {
      page: 'tree',
    },
  },
  {
    path: 'clipboard',
    loadComponent: async () => import('./pages/clipboard-page/clipboard-page.component').then(m => m.ClipboardPageComponent),
    title: 'Clipboard',
    data: {
      page: 'clipboard',
    },
  },
  {
    path: 'form-fields',
    loadComponent: async () => import('./pages/form-fields-page/form-fields-page.component').then(m => m.FormFieldsPageComponent),
    title: 'Form Fields',
    data: {
      page: 'form-fields',
    },
  },
  {
    path: 'radios',
    loadComponent: async () => import('./pages/radio-buttons-page/radio-buttons-page.component').then(m => m.RadioButtonsPageComponent),
    title: 'Radio Buttons',
    data: {
      page: 'radios',
    },
  },
  {
    path: 'scroller',
    loadComponent: async () => import('./pages/scroller-page/scroller-page.component').then(m => m.ScrollerPageComponent),
    title: 'Arrow Scroller',
    data: {
      page: 'scroller',
    },
  },
];
