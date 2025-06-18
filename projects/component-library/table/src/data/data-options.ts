import type { Primitive } from 'tableau-ui-angular/types';
import type { FullDataRequest, IncrementalDataRequest } from './data-request';
import type { FullDataResponse, IncrementalDataResponse } from './data-response';

class BaseDataOptions<TData> {
    constructor(public readonly getRowKey: (row: TData) => Primitive) {}
}

export class IncrementalDataOptions<TData> extends BaseDataOptions<TData> {
    constructor(
        getRowKey: (row: TData) => Primitive,
        public readonly getDataBlock: (req: IncrementalDataRequest) => Promise<IncrementalDataResponse<TData>>,
    ) {
        super(getRowKey);
    }
}
export class FullDataOptions<TData> extends BaseDataOptions<TData> {
    constructor(
        getRowKey: (row: TData) => Primitive,
        public readonly getAllData: (req: FullDataRequest) => Promise<FullDataResponse<TData>>,
    ) {
        super(getRowKey);
    }
}

export type DataOptions<TData> = IncrementalDataOptions<TData> | FullDataOptions<TData>;
