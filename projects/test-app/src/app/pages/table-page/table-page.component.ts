import { Component, ResourceLoader, ResourceLoaderParams, signal } from '@angular/core';
import { small_data, data } from './table-data-sample';
import { DataRequest, DataResponse, HeaderContext } from 'component-library';

@Component({
    selector: 'app-table-page',
    templateUrl: './table-page.component.html',
    styleUrl: './table-page.component.scss',
    standalone: false
})
export class TablePageComponent {


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

    async loadBlock(req: DataRequest): Promise<DataResponse> {
        console.log('Loading data block with request:', req);
        // Simulate a data load with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const slicedData = data.slice(req.offset, req.offset + req.count);
        // Return a mock response
        const ret = {
            count: slicedData.length,
            offset: req.offset,
            total: data.length,
            data: slicedData
        };
        console.log('Loaded data block:', ret);
        return ret;
    }

    customCalculatedClass(ctx: HeaderContext): string | undefined {
        return `custom-dynamic-class-${ctx.index % 3}`;
    }

}
