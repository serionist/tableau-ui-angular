import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { data } from './table-data-sample';
import type { DataRequest, DataResponse, HeaderContext } from 'tableau-ui-angular/table';
import { MultiSelectionOptions, SelectAllOptions, SingleSelectionOptions, TableauUiTableModule, TableComponent } from 'tableau-ui-angular/table';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { CommonModule } from '@angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiExpansionPanelModule } from '../../../../../component-library/expansion-panel/src/tableau-ui-expansion-panel.module';
import { TableauUiTabgroupModule } from '../../../../../component-library/tab-group/src/tableau-ui-tab-group.module';
import { TableauUiRadioGroupModule } from '../../../../../component-library/radio-group/src/tableau-ui-radio-group.module';

@Component({
    selector: 'app-table-page',
    imports: [TableauUiCommonModule, TableauUiCheckboxModule, TableauUiExpansionPanelModule, TableauUiTableModule, CommonModule, TableauUiButtonModule, TableauUiTabgroupModule, TableauUiRadioGroupModule],
    standalone: true,
    templateUrl: './table-page.component.html',
    styleUrl: './table-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePageComponent {
    readonly $show_first_3_columns = signal(false);
    readonly $striped = signal(false);
    readonly $showData = signal(true);
    readonly $errorOnData = signal(false);
    readonly $customNoDataTemplate = signal(false);

    readonly $pinColumns = signal(false);

    readonly $pinnedLeftColumn = computed(() => {
        if (this.$pinColumns()) {
            return 'id';
        }
        return undefined;
    });
    readonly $pinnedRightColumn = computed(() => {
        if (this.$pinColumns()) {
            return 'age';
        }
        return undefined;
    });

    readonly $selectionMode = signal<'single' | 'multi' | 'none'>('none');
    readonly $clearSelectionOnManualReset = signal(true);
    readonly $clearSelectionOnAnyReset = signal(false);

    readonly $selectionType = signal<'row-selection' | 'checkbox-selection' | 'both'>('row-selection');

    readonly $multiSelectHeaderCheckboxMode = signal<'none' | 'selectNone' | 'selectAll'>('none');

    private readonly selectionGetKey = (row: DataType): number => row.id;
    private readonly selectionGetAllKeys = async (abort: AbortSignal) => {
        await new Promise((r) => setTimeout(r, 5000)); // Simulate async operation
        if (abort.aborted) {
            throw new Error('Selection get all keys aborted');
        }
        throw new Error('Simulated error in selection get all keys'); // Simulate an error
        return data.map((row) => row.id);
    };
    readonly $selectionOptions = computed(() => {
        switch (this.$selectionMode()) {
            case 'none':
                return undefined;
            case 'single':
                return new SingleSelectionOptions<DataType, number>(this.selectionGetKey, this.$selectionType(), this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
            case 'multi': {
                let headerCheckboxMode: 'none' | 'selectNone' | SelectAllOptions<number> = 'none';
                switch (this.$multiSelectHeaderCheckboxMode()) {
                    case 'none':
                        headerCheckboxMode = 'none';
                        break;
                    case 'selectNone':
                        headerCheckboxMode = 'selectNone';
                        break;
                    case 'selectAll':
                        headerCheckboxMode = new SelectAllOptions(this.selectionGetAllKeys);
                        break;
                }
                return new MultiSelectionOptions<DataType, number>(this.selectionGetKey, this.$selectionType(), headerCheckboxMode, this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
            }
        }
        return undefined;
    });

    readonly $selectedKeys = signal<number[]>([]);

    loadBlock: (req: DataRequest) => Promise<DataResponse<DataType>> = async (req: DataRequest) => {
        console.log('Loading data block with request:', req);
        // Simulate a data load with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (req.abort.aborted) {
            console.warn('Data load aborted:', req);
        }
        if (!this.$showData()) {
            console.log('Data loading is disabled, returning empty response');
            return {
                total: 0,
                data: [],
            };
        }
        if (this.$errorOnData() && req.offset > 20) {
            console.error('Simulated error on data load');
            throw new Error('Simulated error on data load');
        }
        const sortedData = [...data].sort((a, b) => {
            if (req.sort.length > 0) {
                for (const sort of req.sort) {
                    const aValue = (a as Record<string, boolean | number | string>)[sort.property];
                    const bValue = (b as Record<string, boolean | number | string>)[sort.property];
                    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                    if (aValue === bValue) continue; // Equal values, check next sort
                }
            }
            return 0; // No sorting applied
        });
        const slicedData = sortedData.slice(req.offset, req.offset + req.count);
        // Return a mock response
        const ret = {
            total: data.length,
            data: slicedData,
        };
        console.log('Loaded data block:', ret);
        return ret;
    };

    private readonly tabTable = viewChild.required<TableComponent>(TableComponent);
    reset(showData: boolean, errorOnData: boolean) {
        this.$showData.set(showData);
        this.$errorOnData.set(errorOnData);
        this.tabTable().reset();
    }
    customCalculatedClass(ctx: HeaderContext): string | undefined {
        return `custom-dynamic-class-${ctx.index % 3}`;
    }
}
export interface DataType {
    id: number;
    name: string;
    age: number;
    gender: string;
    country: string;
    city: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    username: string;
    birthdate: string;
    joinDate: string;
    isActive: boolean;
    score: number;
    role: string;
    department: string;
    employeeId: string;
    language: string;
    notes: string;
}
