import { Pipe, PipeTransform } from '@angular/core';
import { TreeNodeInterface } from '../tree-node-interface';

@Pipe({
    name: 'shouldShowNode',
    standalone: false,
})
export class ShouldShowNodePipe implements PipeTransform {
    transform(child: TreeNodeInterface): boolean {
        let p: TreeNodeInterface | null = child.$parent();
        while (p) {
            if (!p.$expanded()) {
                return false;
            }
            p = p.$parent();
        }
        return true;
    }
}
