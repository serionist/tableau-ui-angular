import { Component, ResourceLoader, ResourceLoaderParams, signal, viewChild } from '@angular/core';
import { small_data, data } from './table-data-sample';
import { DataRequest, DataResponse, HeaderContext, TableComponent } from 'component-library';

@Component({
    selector: 'app-table-page',
    templateUrl: './table-page.component.html',
    styleUrl: './table-page.component.scss',
    standalone: false
})
export class TablePageComponent {


    show_first_3_columns = signal(false);
    striped = signal(false);
    showData = signal(true);
    errorOnData = signal(false);
    customNoDataTemplate = signal(false);
    // async loadData(params: ResourceLoaderParams<DataTrigger>): Promise<DataResponse> {
    //     console.log('Triggered stuff', params);
    //     return {
    //         count: 0,
    //         offset: 0,
    //         totalCount: 0,
    //         data: []
    //     }
    // }

    loadBlock: (req: DataRequest) => Promise<DataResponse> = async (req: DataRequest) => {
        console.log('Loading data block with request:', req);
        // Simulate a data load with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (req.abort.aborted) {
            console.warn('Data load aborted:', req);
        }
        if (!this.showData()) {
            console.log('Data loading is disabled, returning empty response');
            return {
                total: 0,
                data: []
            };
        }
        if (this.errorOnData() && req.offset > 20) {
            console.error('Simulated error on data load');
            throw new Error('Simulated error on data load');
        }
        const sortedData = [...data].sort((a, b) => {
            if (req.sort && req.sort.length > 0) {
                for (const sort of req.sort) {
                    const aValue = (a as any)[sort.property];
                    const bValue = (b as any)[sort.property];
                    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                    if (aValue === bValue) continue; // Equal values, check next sort
                }
            }
            return 0; // No sorting applied
        }
        );
        const slicedData = sortedData.slice(req.offset, req.offset + req.count);
        // Return a mock response
        const ret = {
            total: data.length,
            data: slicedData
        };
        console.log('Loaded data block:', ret);
        return ret;
    }
    private tabTable = viewChild.required<TableComponent>(TableComponent);
    reset(showData: boolean, errorOnData: boolean) {
        this.showData.set(showData);
        this.errorOnData.set(errorOnData);
        this.tabTable().reset();
    }
    customCalculatedClass(ctx: HeaderContext): string | undefined {
        return `custom-dynamic-class-${ctx.index % 3}`;
    }

}
