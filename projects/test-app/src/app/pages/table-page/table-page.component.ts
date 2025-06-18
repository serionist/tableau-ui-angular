import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { data } from './table-data-sample';
import type { CellContext, DataSort, FullDataRequest, HeaderContext, IncrementalDataRequest } from 'tableau-ui-angular/table';
import { FullDataOptions, IncrementalDataOptions, MultiSelectionOptions, SingleSelectionOptions, TableauUiTableModule, TableComponent } from 'tableau-ui-angular/table';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { CommonModule } from '@angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiExpansionPanelModule } from '../../../../../component-library/expansion-panel/src/tableau-ui-expansion-panel.module';
import { TableauUiTabgroupModule } from '../../../../../component-library/tab-group/src/tableau-ui-tab-group.module';
import { TableauUiRadioGroupModule } from '../../../../../component-library/radio-group/src/tableau-ui-radio-group.module';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';

@Component({
    selector: 'app-table-page',
    imports: [
        TableauUiCommonModule,
        TableauUiCheckboxModule,
        TableauUiExpansionPanelModule,
        TableauUiTableModule,
        CommonModule,
        TableauUiButtonModule,
        TableauUiTabgroupModule,
        TableauUiRadioGroupModule,
        TableauUiButtonToggleModule,
    ],
    standalone: true,
    templateUrl: './table-page.component.html',
    styleUrl: './table-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePageComponent implements AfterViewInit {
    readonly $dataMode = signal<'incremental' | 'full'>('incremental');
    readonly $showData = signal(true);
    readonly $errorOnData = signal(false);
    private readonly baseDataRequest: (abort: AbortSignal, dataSort: readonly DataSort[]) => Promise<DataType[]> = async (abort: AbortSignal, dataSort: readonly DataSort[]) => {
        // Simulate a data load with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (abort.aborted) {
            throw new Error('Data load aborted');
        }
        if (!this.$showData()) {
            console.log('Data loading is disabled, returning empty response');
            return [];
        }

        const sortedData = [...data].sort((a, b) => {
            if (dataSort.length > 0) {
                for (const sort of dataSort) {
                    const aValue = (a as Record<string, boolean | number | string>)[sort.property];
                    const bValue = (b as Record<string, boolean | number | string>)[sort.property];
                    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                    if (aValue === bValue) continue; // Equal values, check next sort
                }
            }
            return 0; // No sorting applied
        });
        return sortedData;
    };
    readonly $dataOptions = computed(() => {
        console.log('Creating data options for mode:', this.$dataMode());
        switch (this.$dataMode()) {
            case 'incremental':
                return new IncrementalDataOptions<DataType>(
                    (d) => d.id,
                    async (req: IncrementalDataRequest) => {
                        console.log('Loading data block with request:', req);
                        const dataReq = await this.baseDataRequest(req.abort, req.sort);
                        if (this.$errorOnData() && req.offset > 20) {
                            console.error('Simulated error on data load');
                            throw new Error('Simulated error on data load');
                        }
                        const slicedData = dataReq.slice(req.offset, req.offset + req.count);
                        // Return a mock response
                        const ret = {
                            total: dataReq.length,
                            data: slicedData,
                        };
                        console.log('Loaded data block:', ret);
                        return ret;
                    },
                );
            case 'full':
                return new FullDataOptions<DataType>(
                    (d) => d.id,
                    async (req: FullDataRequest) => {
                        console.log('Loading full data with request:', req);
                        const dataReq = await this.baseDataRequest(req.abort, req.sort);
                        if (this.$errorOnData()) {
                            console.error('Simulated error on data load');
                            throw new Error('Simulated error on data load');
                        }
                        // Return a mock response
                        const ret = {
                            total: dataReq.length,
                            data: dataReq,
                        };
                        console.log('Loaded full data:', ret);
                        return ret;
                    },
                );
        }
        throw new Error('Invalid data mode');
    });

    readonly $show_first_3_columns = signal(false);
    readonly $striped = signal(false);

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

    readonly $allowRowSelection = signal(false);

    readonly $multiSelectHeaderCheckboxMode = signal<'none' | 'selectNone' | 'selectAll'>('none');

    readonly $selectionOptions = computed(() => {
        switch (this.$selectionMode()) {
            case 'none':
                return undefined;
            case 'single':
                return new SingleSelectionOptions(this.$allowRowSelection() ? 'row-and-checkbox' : 'checkbox', this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
            case 'multi': {
                const headerCheckboxMode: 'none' | 'selectNone' | 'selectAll' = this.$multiSelectHeaderCheckboxMode();

                return new MultiSelectionOptions(headerCheckboxMode, this.$allowRowSelection() ? 'row-and-checkbox' : 'checkbox', this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
            }
        }
        return undefined;
    });

    readonly $selectedRows = signal<Map<number, DataType>>(new Map<number, DataType>());

    private readonly tabTable = viewChild.required<TableComponent<DataType>>(TableComponent);
    reset(showData: boolean, errorOnData: boolean) {
        this.$showData.set(showData);
        this.$errorOnData.set(errorOnData);
        void this.tabTable().reset();
    }
    customCalculatedClass(ctx: HeaderContext<DataType>): string | undefined {
        return `custom-dynamic-class-${ctx.meta.index % 3}`;
    }

    ngAfterViewInit(): void {
        void this.tabTable().load();
    }

    $showCellTooltip(cellContext: CellContext<DataType>) {
        return cellContext.meta.odd;
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
