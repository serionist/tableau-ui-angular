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

interface Person {
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

const pick = (values: readonly string[], id: number) => values[id % values.length];

// 10,000 made-up people, the same on every load
const PEOPLE: Person[] = Array.from({ length: 10_000 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    name: `User ${id}`,
    age: 18 + ((id * 7) % 60),
    gender: pick(['Female', 'Male', 'Other'], id),
    country: pick(['Japan', 'Brazil', 'France', 'Canada', 'India'], id),
    city: `City ${id % 97}`,
    email: `user${id}@mail.com`,
    phone: `+1-555-${String(id).padStart(6, '0')}`,
    address: `${(id * 13) % 999} High St`,
    zipCode: String(10000 + ((id * 37) % 89999)),
    username: `user${id}`,
    birthdate: `${1950 + (id % 50)}-0${1 + (id % 9)}-1${id % 10}`,
    joinDate: `${2010 + (id % 15)}-0${1 + (id % 9)}-2${id % 8}`,
    isActive: id % 4 !== 0,
    score: (id * 13) % 100,
    role: pick(['Analyst', 'Manager', 'Director', 'Engineer'], id),
    department: `Dept ${id % 12}`,
    employeeId: `EMP${1000 + id}`,
    language: pick(['English', 'Spanish', 'Japanese', 'French'], id),
    notes: `Note ${id}`,
  };
});

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
  private async request(abort: AbortSignal, dataSort: readonly DataSort[]): Promise<Person[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (abort.aborted) {
      throw new Error('Data load aborted');
    }
    if (!this.$showData()) {
      return [];
    }
    const rows = this.$showTop2Data() ? PEOPLE.slice(0, 2) : [...PEOPLE];
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
        return new IncrementalDataOptions<Person>(
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
        return new FullDataOptions<Person>(
          row => row.id,
          async (req: FullDataRequest) => {
            const rows = await this.request(req.abort, req.sort);
            if (this.$errorOnData()) {
              throw new Error('Simulated error on data load');
            }
            return { data: rows };
          },
        );
    }
    throw new Error('Unknown data mode');
  });

  private readonly tabTable = viewChild.required<TableComponent<Person>>(TableComponent);

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
  customCalculatedClass(ctx: HeaderContext<Person>): string | undefined {
    return `custom-dynamic-class-${ctx.meta.index % 3}`;
  }

  // The cell tooltip shows on odd rows only
  $showCellTooltip(cellContext: CellContext<Person>) {
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

  readonly $selectedRows = signal<Map<number, Person>>(new Map<number, Person>());

  // Names each row's checkbox for screen readers: "Select User 12"
  readonly personName = (person: Person) => person.name;
  // #endregion
}
