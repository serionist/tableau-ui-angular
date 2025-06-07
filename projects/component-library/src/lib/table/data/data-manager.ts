import { ChangeDetectorRef, computed, Signal, signal } from '@angular/core';
import { DataSort } from '../sorting/data-sort';
import { DataBlock } from './data-block';
import { DataRequest } from './data-request';
import { DataResponse } from './data-response';

export class DataManager {
    constructor(private cdr: ChangeDetectorRef) {}
    private readonly $dataRowHeightPx = signal<number>(0);
    private readonly $dataWindowHeightPx = signal<number>(0);
    private readonly $displayedColumns = signal<string[]>([]);
    private readonly $sort = signal<DataSort[]>([]);
    private readonly $dataBlockWindow = signal<number>(0);
    private readonly $dataBlockHeightPx = computed(() => {
        return this.$dataRowHeightPx() * this.$blockRowCount();
    });
    private readonly $blockRowCount = computed(() => {
        return Math.floor(this.$dataWindowHeightPx() / this.$dataRowHeightPx());
    });

    private readonly $_totalRowCount = signal(0);
    public get $totalRowCount(): Signal<number> {
        return this.$_totalRowCount;
    }
    private getDataBlock: (req: DataRequest) => Promise<DataResponse> = undefined!;

    private readonly $_blocks = signal<BlocksInfo>({
        prePixels: 0,
        blocks: [],
        postPixels: 0,
    });
    get $blocks(): Signal<BlocksInfo> {
        return this.$_blocks;
    }

    public async reset(dataWindowHeightPx: number, dataRowHeightPx: number, sort: DataSort[], displayedColumns: string[], dataBlockWindow: number, getDataBlock: (req: DataRequest) => Promise<DataResponse>) {
        this.getDataBlock = getDataBlock;
        this.$dataRowHeightPx.set(dataRowHeightPx);
        this.$dataWindowHeightPx.set(dataWindowHeightPx);
        this.$displayedColumns.set(displayedColumns);
        this.$dataBlockWindow.set(dataBlockWindow);
        this.$sort.set(sort);
        this.$_totalRowCount.set(0);
        // load initial block
        const initialBlock = new DataBlock(0, displayedColumns, 0, this.$blockRowCount(), sort, new AbortController(), this.getDataBlock);
        this.$_blocks.update((blocks) => {
            // Clear existing blocks
            blocks.blocks.forEach((block) => block.destroy());
            return {
                prePixels: 0,
                blocks: [initialBlock],
                postPixels: 0,
            };
        });
        this.cdr.markForCheck();
        await initialBlock.load();
        const initialBlockStatus = initialBlock.$status();
        const initialBlockResponse = initialBlock.$response();
        if (initialBlockStatus !== 'success' || !initialBlockResponse) {
            console.error('Initial data block failed to load:', initialBlockStatus, initialBlockResponse);
            return;
        }
        this.$_totalRowCount.set(initialBlockResponse.total);
        this.cdr.markForCheck();
        this.setScrollPosition(0);
    }

    setScrollPosition(topPx: number) {
        // get the block IDs in the current viewPort
        const bottomPx = topPx + this.$dataWindowHeightPx();

        const firstVisibleBlockId = Math.floor(topPx / this.$dataBlockHeightPx());
        const lastVisibleBlockId = Math.floor(bottomPx / this.$dataBlockHeightPx());

        const dataBlockWindow = this.$dataBlockWindow();
        // we are loading
        // - [dataBlockWindow] blocks before the first visible block
        // - all the visible blocks
        // - [dataBlockWindow] blocks after the last visible block
        const blockIdsToLoad: number[] = [];

        for (let i = firstVisibleBlockId - dataBlockWindow; i <= lastVisibleBlockId + dataBlockWindow; i++) {
            if (i < 0) {
                continue;
            }
            if (i * this.$blockRowCount() >= this.$_totalRowCount()) {
                // No more data to load
                continue;
            }
            blockIdsToLoad.push(i);
        }

        this.$_blocks.update((existing) => {
            const blocks: DataBlock[] = [];
            for (const existingBlock of existing.blocks) {
                if (blockIdsToLoad.includes(existingBlock.id)) {
                    blocks.push(existingBlock);
                    existingBlock.load();
                } else {
                    existingBlock.destroy();
                }
            }
            for (const blockId of blockIdsToLoad) {
                if (!blocks.some((b) => b.id === blockId)) {
                    const newBlock = new DataBlock(blockId, this.$displayedColumns(), blockId * this.$blockRowCount(), this.$blockRowCount(), this.$sort(), new AbortController(), this.getDataBlock);
                    blocks.push(newBlock);
                    newBlock.load();
                }
            }

            existing.blocks = blocks.sort((a, b) => a.id - b.id);

            // // rows before the first block
            existing.prePixels = existing.blocks.length === 0 ? 0 : existing.blocks[0].id * this.$dataBlockHeightPx();
            // // rows after the last block
            const lastBlock = existing.blocks.length === 0 ? undefined : existing.blocks[existing.blocks.length - 1];
            const preAndDisplayedRowsCount = (lastBlock?.offset ?? 0) + (lastBlock?.count ?? 0);
            const postRowsCount = this.$totalRowCount() - preAndDisplayedRowsCount;
            existing.postPixels = Math.max(0, postRowsCount) * this.$dataRowHeightPx();
            return existing;
        });
    }
}

export interface BlocksInfo {
    prePixels: number;
    blocks: DataBlock[];
    postPixels: number;
}
