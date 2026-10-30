import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, Injector, signal, viewChild } from '@angular/core';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import type { DataSort, FullDataRequest, IncrementalDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions, IncrementalDataOptions, TableauUiVirtualizeModule, VirtualizeComponent } from 'tableau-ui-angular/virtualize';
import type { DataType } from '../table-page/table-data-sample';
import { data } from '../table-page/table-data-sample';
import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';

@Component({
  selector: 'app-virtualize-page',
  imports: [TableauUiVirtualizeModule, TableauUiCommonModule, TableauUiRadioGroupModule, TableauUiButtonToggleModule, TableauUiExpansionPanelModule, TableauUiCheckboxModule, TableauUiButtonModule],
  standalone: true,
  templateUrl: './virtualize-page.component.html',
  styleUrl: './virtualize-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualizePageComponent {
  private readonly $virtualizeContainer = viewChild.required<VirtualizeComponent<DataType>>(VirtualizeComponent);
  readonly $dataMode = signal<'incremental' | 'full'>('incremental');

  readonly $showData = signal(true);
  readonly $errorOnData = signal(false);
  readonly $customNoDataTemplate = signal(false);

  readonly $mode = signal<'fixed' | 'expand'>('fixed');

  private readonly injector = inject(Injector);
  // the container measures its height once it is drawn, which the server never does; the first run loads it
  readonly modeChanged = effect(() => {
    this.$mode();
    afterNextRender(() => void this.$virtualizeContainer().reload(), { injector: this.injector });
  });
  readonly $showTop2Data = signal(false);
  private readonly baseDataRequest: (abort: AbortSignal, dataSort: readonly DataSort[]) => Promise<DataType[]> = async (abort: AbortSignal, dataSort: readonly DataSort[]) => {
    // Simulate a data load with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (abort.aborted) {
      console.warn('Data load aborted');
      throw new Error('Data load aborted');
    }
    if (!this.$showData()) {
      console.log('Data loading is disabled, returning empty response');
      return [];
    }
    let d = [...data];
    if (this.$showTop2Data()) {
      console.log('Returning top 2 data items');
      d = d.slice(0, 2);
    }

    const sortedData = [...d].sort((a, b) => {
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
          d => d.id,
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
          d => d.id,
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
  reset(showData: boolean, errorOnData: boolean, top2Data: boolean) {
    this.$showData.set(showData);
    this.$errorOnData.set(errorOnData);
    this.$showTop2Data.set(top2Data);
    void this.$virtualizeContainer().reset();
  }
}
