import { Component } from '@angular/core';
import { small_data } from './table-data-sample';
import { HeaderContext } from 'component-library';

@Component({
    selector: 'app-table-page',
    templateUrl: './table-page.component.html',
    styleUrl: './table-page.component.scss',
    standalone: false
})
export class TablePageComponent {

    data = small_data;


    customCalculatedClass(ctx: HeaderContext): string | undefined {
        return `custom-dynamic-class-${ctx.index % 3}`;
    }
    
}
