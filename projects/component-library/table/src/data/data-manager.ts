import type { ChangeDetectorRef, Signal } from '@angular/core';
import { signal } from '@angular/core';
import type { DataSort } from '../sorting/data-sort';
import { DataBlock } from './data-block';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataOptions } from './data-options';
import { FullDataOptions, IncrementalDataOptions } from './data-options';

export class DataManager<TData, TKey extends Primitive> {
    constructor(private readonly cdr: ChangeDetectorRef) {}
    private dataRowHeightPx: number = 0;
    private dataWindowHeightPx: number = 0;
    private displayedColumns: string[] = [];
    private sort: DataSort[] = [];
    private dataBlockWindow: number = 0;
    private dataBlockHeightPx: number = 0;
    private blockRowCount: number = 0;
    private _totalRowCount = 0;
    public get totalRowCount() {
        return this._totalRowCount;
    }
    private dataOptions: DataOptions<TData, TKey> | undefined = undefined;
    private readonly $_blocks = signal<BlocksInfo<TData, TKey>>({
        prePixels: 0,
        blocks: [],
        postPixels: 0,
    });
    get $blocks(): Signal<BlocksInfo<TData, TKey>> {
        return this.$_blocks;
    }

    private _allDataInfo: AllDataInfo<TData, TKey> | undefined = undefined;
    get allDataInfo(): AllDataInfo<TData, TKey> | undefined {
        return this._allDataInfo;
    }
    private resetting = false;
    public async reset(dataWindowHeightPx: number, dataRowHeightPx: number, sort: DataSort[], displayedColumns: string[], dataBlockWindow: number, dataOptions: DataOptions<TData, TKey>) {
        this.resetting = true;
        this.dataOptions = dataOptions;
        this.dataRowHeightPx = dataRowHeightPx;
        this.dataWindowHeightPx = dataWindowHeightPx;
        this.displayedColumns = displayedColumns;
        this.sort = sort;
        this.dataBlockWindow = dataBlockWindow;
        this.blockRowCount = Math.floor(dataWindowHeightPx / dataRowHeightPx);
        this.dataBlockHeightPx = dataRowHeightPx * this.blockRowCount;
        this._totalRowCount = 0;

        if (this._allDataInfo) {
            this._allDataInfo.abort.abort();
            this._allDataInfo = undefined;
        }

        if (!Number.isFinite(this.blockRowCount) || this.blockRowCount <= 0) {
            this.$_blocks.set({
                prePixels: 0,
                blocks: [],
                postPixels: 0,
            });
            this.resetting = false;
            return;
        }

        let initialBlock: DataBlock<TData, TKey> | undefined = undefined;
        if (this.dataOptions instanceof IncrementalDataOptions) {
            initialBlock = this.getBlock(0);
        } else if (this.dataOptions instanceof FullDataOptions) {
            const allDataAbort = new AbortController();
            let allDataPromise: Promise<{key: TKey, data: TData}[]>;

            if (!Number.isFinite(this.blockRowCount)) {
                allDataPromise = Promise.resolve([]);
            } else {
                allDataPromise = this.dataOptions
                    .getAllData({
                        sort: sort,
                        abort: allDataAbort.signal,
                    })
                    .then((response) => {
                        this._totalRowCount = response.data.length;
                        return response.data.map(row => ({
                            key: this.dataOptions!.getRowKey(row),
                            data: row,
                        }));
                    });
            }
            this._allDataInfo = new AllDataInfo<TData, TKey>(allDataPromise, allDataAbort);
            initialBlock = this.getBlock(0);
        } else {
            this.resetting = false;
            throw new Error('Unsupported data options type');
        }

        // load initial block
        this.$_blocks.update((blocks) => {
            // Clear existing blocks
            blocks.blocks.forEach((block) => {
                block.abort?.abort();
            });
            return {
                prePixels: 0,
                blocks: [initialBlock],
                postPixels: 0,
            };
        });
        this.cdr.markForCheck();

        
        try {
            await initialBlock.dataPromise;
            this.cdr.markForCheck();
            this.resetting = false;
            this.setScrollPosition(0);
        } catch (error: unknown) {
            console.error('Error loading initial data block:', error);
            this.cdr.markForCheck();
            this.resetting = false;
        } 
        // const initialBlockStatus = initialBlock.$status();
        // if (initialBlockStatus !== 'success') {
        //     console.error('Initial data block failed to load:', initialBlockStatus);
        //     this.cdr.markForCheck();
        //     return;
        // }
      
    }

    private getBlock(blockId: number): DataBlock<TData, TKey> {
        if (this.allDataInfo) {
            // we are using full data
            const blockPromise = this.allDataInfo.promise.then((data) => {
                return data.slice(blockId * this.blockRowCount, (blockId + 1) * this.blockRowCount);
            });
            return new DataBlock<TData, TKey>(blockId, this.displayedColumns, undefined, this.blockRowCount, this.dataOptions!.getRowKey, blockPromise);
        } else {
            // we are using incremental data
            const blockAbort = new AbortController();
            let blockPromise: Promise<{key: TKey, data: TData}[]>;
            if (!Number.isFinite(this.blockRowCount)) {
                blockPromise = Promise.resolve([]);
            } else {
                blockPromise = (this.dataOptions as IncrementalDataOptions<TData, TKey>)
                    .getDataBlock({
                        offset: blockId * this.blockRowCount,
                        count: this.blockRowCount,
                        sort: this.sort,
                        abort: blockAbort.signal,
                    })
                    .then((response) => {
                        this._totalRowCount = response.total;
                        return response.data.map(row => ({
                            key: this.dataOptions!.getRowKey(row),
                            data: row,
                        }));
                    })
                    .then((data) => {
                        if (data.length > this.blockRowCount) {
                            console.warn(`Data block received unexpected data: count ${data.length}, expected max count ${this.blockRowCount}`);
                            throw new Error(`Data block received unexpected data: count ${data.length}, expected max count ${this.blockRowCount}`);
                        }
                        return data;
                    });
            }
            return new DataBlock<TData, TKey>(blockId, this.displayedColumns, blockAbort, this.blockRowCount, this.dataOptions!.getRowKey, blockPromise);
        }
    }

    setScrollPosition(topPx: number) {
        if (this.resetting) {
            return;
        }
        // get the block IDs in the current viewPort
        const bottomPx = topPx + this.dataWindowHeightPx;

        const firstVisibleBlockId = Math.floor(topPx / this.dataBlockHeightPx);
        const lastVisibleBlockId = Math.floor(bottomPx / this.dataBlockHeightPx);

        const dataBlockWindow = this.dataBlockWindow;
        // we are loading
        // - [dataBlockWindow] blocks before the first visible block
        // - all the visible blocks
        // - [dataBlockWindow] blocks after the last visible block
        const blockIdsToLoad: number[] = [];

        for (let i = firstVisibleBlockId - dataBlockWindow; i <= lastVisibleBlockId + dataBlockWindow; i++) {
            if (i < 0) {
                continue;
            }
            if (i * this.blockRowCount >= this.totalRowCount) {
                // No more data to load
                continue;
            }
            blockIdsToLoad.push(i);
        }

        this.$_blocks.update((existing) => {
            const blocks: DataBlock<TData, TKey>[] = [];
            for (const existingBlock of existing.blocks) {
                if (blockIdsToLoad.includes(existingBlock.id)) {
                    blocks.push(existingBlock);
                } else {
                    existingBlock.abort?.abort();
                }
            }
            for (const blockId of blockIdsToLoad) {
                if (!blocks.some((b) => b.id === blockId)) {
                    const newBlock = this.getBlock(blockId);
                    blocks.push(newBlock);
                }
            }

            existing.blocks = blocks.sort((a, b) => a.id - b.id);

            // // rows before the first block
            existing.prePixels = existing.blocks.length === 0 ? 0 : existing.blocks[0].id * this.dataBlockHeightPx;
            // // rows after the last block
            const lastBlock = existing.blocks.length === 0 ? undefined : existing.blocks[existing.blocks.length - 1];
            const preAndDisplayedRowsCount = (lastBlock?.offset ?? 0) + (this.blockRowCount ?? 0);
            const postRowsCount = this.totalRowCount - preAndDisplayedRowsCount;
            existing.postPixels = Math.max(0, postRowsCount) * this.dataRowHeightPx;
            return existing;
        });
    }
}

export interface BlocksInfo<TData, TKey extends Primitive> {
    prePixels: number;
    blocks: DataBlock<TData, TKey>[];
    postPixels: number;
}

export class AllDataInfo<TData, TKey extends Primitive = Primitive> {
    private readonly $_allKeys = signal<Set<TKey>>(new Set<TKey>());
    get $allKeys(): Signal<Set<TKey>> {
        return this.$_allKeys;
    }
    private readonly $_status = signal<'canceled' | 'error' | 'loading' | 'success'>('loading');
    get $status(): Signal<'canceled' | 'error' | 'loading' | 'success'> {
        return this.$_status;
    }
    constructor(
        public readonly promise: Promise<{key: TKey, data: TData}[]>,
        public readonly abort: AbortController,
    ) {
        promise
            .then(data => {
                this.$_allKeys.set(new Set(data.map(item => item.key)));
                this.$_status.set('success');
            })
            .catch((error: unknown) => {
                if (this.abort.signal.aborted) {
                    this.$_status.set('canceled');
                    throw error;
                }
                this.$_status.set('error');
                console.error('Error loading all data:', error);
                throw error;
            });
    }
}
