export interface FullDataResponse<TData> {
  readonly data: TData[];
}
export interface IncrementalDataResponse<TData> extends FullDataResponse<TData> {
  readonly total: number;
}
