import type { PipeTransform, TemplateRef } from '@angular/core';
import { Pipe } from '@angular/core';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';

import type { HeaderContext, HeaderTooltipContext } from './header-context';
import type { ColumnDefDirective, SortOrderPair } from '../column-def/column-def.directive';
import type { TableComponent } from '../../table.component';
import type { DataSort } from '../../sorting/data-sort';

@Pipe({
  name: 'headerTooltip',
  standalone: false,
})
export class HeaderTooltipPipe implements PipeTransform {
  transform<TData>(
    columnDef: ColumnDefDirective<TData>,
    table: TableComponent<TData>,
    headerContext: HeaderContext<TData>,
    autoHeaderTooltipTemplate: TemplateRef<{ $implicit: HeaderTooltipContext<TData> }>,
    contextParams: {
      sortMode: 'multi' | 'single';
      sortable: boolean;
      sortOrder: SortOrderPair;
      currentSort: { info: DataSort; index: number } | undefined;
      allSorts: DataSort[];
    },
  ): () => TooltipArgs<{ $implicit: HeaderTooltipContext<TData> }> {
    return () => {
      const tooltipArgs: TooltipArgs<{ $implicit: HeaderTooltipContext<TData> }> = {
        template: undefined,
        position: 'top',
        margin: '1rem',
        context: {
          $implicit: {
            ...headerContext,
            headerTemplate: columnDef.$header()?.templateRef,
            ...contextParams,
          },
        },
      };

      // if we have a custom [tabHeaderTooltipDef] directive in our column definition
      const tooltipDef = columnDef.$headerTooltip();
      if (tooltipDef) {
        // check if user has provided a value to show the custom tooltip
        // this can be a boolean or a function that returns a boolean
        const showCustomParam = tooltipDef.$showTooltip();
        let showCustomTooltip: boolean;
        // if its a function, call it with the header context to see if we need to show the custom tooltip
        if (typeof showCustomParam === 'function') {
          showCustomTooltip = showCustomParam(headerContext);
        } else {
          // if its a boolean, use it directly
          showCustomTooltip = showCustomParam;
        }
        // if we show custom tooltip, use the custom template
        if (showCustomTooltip) {
          tooltipArgs.template = tooltipDef.templateRef;
          tooltipArgs.position = tooltipDef.$tooltipPosition();
          tooltipArgs.margin = tooltipDef.$tooltipMargin();
        }
      }

      // if we have not set tooltipArgs.template yet,
      // it means we are not showing a custom tooltip
      if (tooltipArgs.template === undefined && columnDef.$showAutoHeaderTooltip()) {
        tooltipArgs.template = autoHeaderTooltipTemplate;
      }

      // return the tooltip args
      return tooltipArgs;
    };
  }
}
