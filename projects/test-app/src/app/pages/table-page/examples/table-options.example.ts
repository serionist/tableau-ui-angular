import { NgTemplateOutlet } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import type { CellContext, HeaderContext } from 'tableau-ui-angular/table';
import { MultiSelectionOptions, SingleSelectionOptions, TableauUiTableModule, TableComponent } from 'tableau-ui-angular/table';
import type { DataSort, FullDataRequest, IncrementalDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions, IncrementalDataOptions } from 'tableau-ui-angular/virtualize';
import type { DataType } from '../table-data-sample';
import { data } from '../table-data-sample';

@Component({
  selector: 'app-table-options-example',
  imports: [NgTemplateOutlet, TableauUiButtonModule, TableauUiButtonToggleModule, TableauUiCheckboxModule, TableauUiCommonModule, TableauUiExpansionPanelModule, TableauUiTableModule],
  templateUrl: './table-options.example.html',
  styleUrl: './table-options.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOptionsExampleComponent implements AfterViewInit {
  // #region Data
  readonly $dataMode = signal<'incremental' | 'full'>('incremental');
  readonly $showData = signal(true);
  readonly $errorOnData = signal(false);
  readonly $showTop2Data = signal(false);

  // A server answering after a second, with the rows sorted as the table asks
  private async request(abort: AbortSignal, dataSort: readonly DataSort[]): Promise<DataType[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (abort.aborted) {
      throw new Error('Data load aborted');
    }
    if (!this.$showData()) {
      return [];
    }
    const rows = this.$showTop2Data() ? data.slice(0, 2) : [...data];
    return rows.sort((a, b) => {
      for (const sort of dataSort) {
        const aValue = (a as unknown as Record<string, boolean | number | string>)[sort.property];
        const bValue = (b as unknown as Record<string, boolean | number | string>)[sort.property];
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Incremental loads a block at a time as the user scrolls; full loads every row at once. Both draw only the rows that show
  readonly $dataOptions = computed(() => {
    switch (this.$dataMode()) {
      case 'incremental':
        return new IncrementalDataOptions<DataType>(
          row => row.id,
          async (req: IncrementalDataRequest) => {
            const rows = await this.request(req.abort, req.sort);
            if (this.$errorOnData() && req.offset > 20) {
              throw new Error('Simulated error on data load');
            }
            return { total: rows.length, data: rows.slice(req.offset, req.offset + req.count) };
          },
        );
      case 'full':
        return new FullDataOptions<DataType>(
          row => row.id,
          async (req: FullDataRequest) => {
            const rows = await this.request(req.abort, req.sort);
            if (this.$errorOnData()) {
              throw new Error('Simulated error on data load');
            }
            return { total: rows.length, data: rows };
          },
        );
    }
    throw new Error('Unknown data mode');
  });

  private readonly tabTable = viewChild.required<TableComponent<DataType>>(TableComponent);

  ngAfterViewInit(): void {
    void this.tabTable().load();
  }

  reset(showData: boolean, errorOnData: boolean, top2Data: boolean) {
    this.$showData.set(showData);
    this.$errorOnData.set(errorOnData);
    this.$showTop2Data.set(top2Data);
    void this.tabTable().reset();
  }
  // #endregion

  // #region Columns
  readonly $show_first_3_columns = signal(false);
  readonly $striped = signal(false);
  readonly $customNoDataTemplate = signal(false);
  readonly $pinColumns = signal(false);
  readonly $pinnedLeftColumn = computed(() => (this.$pinColumns() ? 'id' : undefined));
  readonly $pinnedRightColumn = computed(() => (this.$pinColumns() ? 'age' : undefined));

  // A header's class from its column's context
  customCalculatedClass(ctx: HeaderContext<DataType>): string | undefined {
    return `custom-dynamic-class-${ctx.meta.index % 3}`;
  }

  // The cell tooltip shows on odd rows only
  $showCellTooltip(cellContext: CellContext<DataType>) {
    return cellContext.meta.odd;
  }
  // #endregion

  // #region Selection
  readonly $selectionMode = signal<'single' | 'multi' | 'none'>('none');
  readonly $clearSelectionOnManualReset = signal(true);
  readonly $clearSelectionOnAnyReset = signal(false);
  readonly $allowRowSelection = signal(false);
  readonly $multiSelectHeaderCheckboxMode = signal<'none' | 'selectNone' | 'selectAll'>('none');

  readonly $selectionOptions = computed(() => {
    const mode = this.$allowRowSelection() ? 'row-and-checkbox' : 'checkbox';
    switch (this.$selectionMode()) {
      case 'none':
        return undefined;
      case 'single':
        return new SingleSelectionOptions(mode, this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
      case 'multi':
        return new MultiSelectionOptions(this.$multiSelectHeaderCheckboxMode(), mode, this.$clearSelectionOnManualReset(), this.$clearSelectionOnAnyReset());
    }
    return undefined;
  });

  readonly $selectedRows = signal<Map<number, DataType>>(new Map<number, DataType>());
  // #endregion
}
