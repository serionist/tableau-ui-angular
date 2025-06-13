import type { Primitive } from "tableau-ui-angular/types";
import type { FullDataRequest, IncrementalDataRequest } from "./data-request";
import type { FullDataResponse, IncrementalDataResponse } from "./data-response";

class BaseDataOptions<TData, TKey extends Primitive> {
    constructor(public readonly getRowKey: (row: TData) => TKey) {
    }
}

export class IncrementalDataOptions<TData, TKey extends Primitive> extends BaseDataOptions<TData, TKey> {
    constructor(
        getRowKey: (row: TData) => TKey,
        public readonly getDataBlock: (req: IncrementalDataRequest) => Promise<IncrementalDataResponse<TData>>
    ) {
        super(getRowKey);
    }
}
export class FullDataOptions<TData, TKey extends Primitive> extends BaseDataOptions<TData, TKey> {
    constructor(
        getRowKey: (row: TData) => TKey,
        public readonly getAllData: (req: FullDataRequest) => Promise<FullDataResponse<TData>>
    ) {
        super(getRowKey);
    }
}

export type DataOptions<TData, TKey extends Primitive> = 
    | IncrementalDataOptions<TData, TKey>
    | FullDataOptions<TData, TKey>;
