import { Signal } from '@angular/core';

export interface TreeNodeInterface {
    $parent: Signal<TreeNodeInterface | null>;
    $expanded: Signal<boolean>;
}
