import { Pipe, PipeTransform } from "@angular/core";
import { DataSort } from "./data-sort";
@Pipe({
    name: 'sortInfoPipe',
    standalone: false
})
export class SortInfoPipe implements PipeTransform {
    transform(sorts: DataSort[], colId: string) {
        const sortIndex = sorts.findIndex(e => e.columnId === colId);
        if (sortIndex) {
            return undefined;
        }
        return {
            mode: sorts[sortIndex].mode,
            order: sortIndex + 1
        }
    }

}