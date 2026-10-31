import { afterNextRender, ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import type { IncrementalDataRequest } from 'tableau-ui-angular/virtualize';
import { IncrementalDataOptions, TableauUiVirtualizeModule, VirtualizeComponent } from 'tableau-ui-angular/virtualize';

interface Row {
  id: number;
  name: string;
}

const ROWS: Row[] = Array.from({ length: 10_000 }, (_, index) => ({ id: index + 1, name: `Row ${index + 1}` }));

@Component({
  selector: 'app-virtualize-height-example',
  imports: [TableauUiButtonModule, TableauUiCommonModule, TableauUiVirtualizeModule],
  templateUrl: './virtualize-height.example.html',
  styleUrl: './virtualize-height.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualizeHeightExampleComponent {
  private readonly list = viewChild.required<VirtualizeComponent<Row>>(VirtualizeComponent);

  // How many rows the loads answer, from the buttons
  private readonly $count = signal(2);

  // The rows come after a second, as from a network, unless a newer load cancels this one
  protected readonly dataOptions = new IncrementalDataOptions<Row>(
    row => row.id,
    async (request: IncrementalDataRequest) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      request.abort.throwIfAborted();
      const rows = ROWS.slice(0, this.$count());
      return { data: rows.slice(request.offset, request.offset + request.count), total: rows.length };
    },
  );

  constructor() {
    afterNextRender(() => {
      void this.list().load();
    });
  }

  protected show(count: number) {
    this.$count.set(count);
    void this.list().reset();
  }
}
