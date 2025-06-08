import type { BehaviorSubject } from "rxjs";
import type { AC } from "../interfaces";
import type { Signal } from "@angular/core";
import type { FormControlStatus } from "@angular/forms";
import type { Meta } from "../meta/interfaces";

export interface Hierarchy {
    

    /**
     *  The parent of this control
     */
    readonly parent: AC | undefined;
    /**
     * The root of this control. This is the top level control in the tree.
     */
    readonly root: AC | undefined;
    
    readonly childList$: BehaviorSubject<AC[]>;
    readonly $childList: Signal<AC[]>;

    getChild: (path?: string[] | string) => AC | undefined;
    
    get hierarchyData(): HierarchyData;

  
}
export interface HierarchyData {
    status: FormControlStatus;
    value: unknown;
    meta: Meta;
    children?: Record<string, HierarchyData>;
}