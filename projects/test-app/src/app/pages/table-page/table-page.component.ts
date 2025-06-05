import { Component, ResourceLoader, ResourceLoaderParams, signal } from '@angular/core';
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

    show_first_3_columns = signal(false);
    

    // async loadData(params: ResourceLoaderParams<DataTrigger>): Promise<DataResponse> {
    //     console.log('Triggered stuff', params);
    //     return {
    //         count: 0,
    //         offset: 0,
    //         totalCount: 0,
    //         data: []
    //     }
    // }

    customCalculatedClass(ctx: HeaderContext): string | undefined {
        return `custom-dynamic-class-${ctx.index % 3}`;
    }

}
