export interface DataResponse<T = unknown> {
    readonly total: number;
    readonly data: T[];
}
