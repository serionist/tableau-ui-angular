export interface ItemContext<TData> {
    item: TData;
    meta: ItemMetaContext;
}
export interface ItemMetaContext {
    index: number;
    first: boolean;
    last: boolean;
    even: boolean;
    odd: boolean;
    count: number;
}