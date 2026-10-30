import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TableauUiTableModule, TableComponent } from 'tableau-ui-angular/table';
import type { FullDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions } from 'tableau-ui-angular/virtualize';

interface Person {
  id: number;
  name: string;
  city: string;
}

const PEOPLE: Person[] = Array.from({ length: 200 }, (_, index) => ({ id: index + 1, name: `Person ${index + 1}`, city: ['Budapest', 'Seattle', 'London', 'Tokyo'][index % 4] }));

@Component({
  selector: 'app-table-basic-example',
  imports: [TableauUiTableModule],
  templateUrl: './table-basic.example.html',
  styleUrl: './table-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBasicExampleComponent implements AfterViewInit {
  private readonly table = viewChild.required<TableComponent<Person>>(TableComponent);

  // The rows, by their key; here sorted in the browser, where a server would sort them for the request
  protected readonly dataOptions = new FullDataOptions<Person>(
    person => person.id,
    async (request: FullDataRequest) => {
      const rows = [...PEOPLE].sort((a, b) => {
        for (const { property, direction } of request.sort) {
          const order = String(a[property as keyof Person]).localeCompare(String(b[property as keyof Person]), undefined, { numeric: true });
          if (order !== 0) {
            return direction === 'asc' ? order : -order;
          }
        }
        return 0;
      });
      return Promise.resolve({ data: rows });
    },
  );

  // The table loads once it is drawn, in the browser: it measures the rows it has room for first
  ngAfterViewInit(): void {
    void this.table().load();
  }
}
