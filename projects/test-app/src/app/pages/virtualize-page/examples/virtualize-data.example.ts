import { afterNextRender, ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';
import type { DataOptions, FullDataRequest, IncrementalDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions, IncrementalDataOptions, TableauUiVirtualizeModule, VirtualizeComponent } from 'tableau-ui-angular/virtualize';

interface Row {
  id: number;
  name: string;
}

// 10,000 rows, the same on every load
const ROWS: Row[] = Array.from({ length: 10_000 }, (_, index) => ({ id: index + 1, name: `Row ${index + 1}` }));

type Answer = 'error' | 'none' | 'rows' | 'two';

@Component({
  selector: 'app-virtualize-data-example',
  imports: [TableauUiButtonModule, TableauUiCommonModule, TableauUiRadioGroupModule, TableauUiVirtualizeModule],
  templateUrl: './virtualize-data.example.html',
  styleUrl: './virtualize-data.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualizeDataExampleComponent {
  private readonly list = viewChild.required<VirtualizeComponent<Row>>(VirtualizeComponent);

  protected readonly $mode = signal<'full' | 'incremental'>('incremental');
  // What the loads answer, from the buttons
  private readonly $answer = signal<Answer>('rows');
  protected readonly $lastRequest = signal('nothing yet');

  // The list loads again, from the start, when its data options change
  protected readonly $dataOptions = computed<DataOptions<Row>>(() =>
    this.$mode() === 'incremental'
      ? new IncrementalDataOptions<Row>(
          row => row.id,
          async (request: IncrementalDataRequest) => {
            this.$lastRequest.set(`rows ${request.offset + 1} to ${request.offset + request.count}`);
            const rows = await this.rows(request.abort);
            if (this.$answer() === 'error' && request.offset > 20) {
              throw new Error('A block after the 20th row failed');
            }
            return { data: rows.slice(request.offset, request.offset + request.count), total: rows.length };
          },
        )
      : new FullDataOptions<Row>(
          row => row.id,
          async (request: FullDataRequest) => {
            this.$lastRequest.set('every row');
            const rows = await this.rows(request.abort);
            if (this.$answer() === 'error') {
              throw new Error('The load failed');
            }
            return { data: rows };
          },
        ),
  );

  constructor() {
    // The list measures its height to know how many rows a block holds, so it loads once it is drawn, in the browser
    afterNextRender(() => {
      void this.list().load();
    });
  }

  protected show(answer: Answer) {
    this.$answer.set(answer);
    void this.list().reset();
  }

  // A server would answer here: the rows come after a second, as from a network, unless a newer load cancels this one
  private async rows(abort: AbortSignal): Promise<Row[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    abort.throwIfAborted();
    const answer = this.$answer();
    if (answer === 'none') {
      return [];
    }
    return answer === 'two' ? ROWS.slice(0, 2) : ROWS;
  }
}
