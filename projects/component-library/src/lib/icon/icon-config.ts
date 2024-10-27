import { InjectionToken } from '@angular/core';
import { TableauUiIconModule } from './tableau-ui-icon.module';

export interface IconConfig {
    enableDynamicIcons?: boolean;
    enableDynamicIconsLocalStorageCache?: boolean;
}

export const ICON_CONFIG = new InjectionToken<IconConfig>('IconConfig', {
    providedIn: TableauUiIconModule,
    factory: () => ({
        enableDynamicIcons: false,
        enableDynamicIconsLocalStorageCache: true,
    }),
});
