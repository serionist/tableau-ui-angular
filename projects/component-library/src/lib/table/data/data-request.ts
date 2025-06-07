import type { DataSort } from '../sorting/data-sort';

export interface DataRequest {
    readonly offset: number;
    readonly count: number;
    readonly sort: readonly DataSort[];
    readonly abort: AbortSignal;
}
