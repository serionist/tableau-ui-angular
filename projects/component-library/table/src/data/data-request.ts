import type { DataSort } from '../sorting/data-sort';

export interface FullDataRequest {
    readonly sort: readonly DataSort[];
    readonly abort: AbortSignal;
}
export interface IncrementalDataRequest extends FullDataRequest {
    readonly offset: number;
    readonly count: number;
}