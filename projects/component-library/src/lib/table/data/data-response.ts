export interface DataResponse {
    readonly offset: number;
    readonly count: number;
    readonly total: number;
    readonly data: Record<string, unknown>[];
}