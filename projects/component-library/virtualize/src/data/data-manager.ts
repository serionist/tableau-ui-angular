import type { ChangeDetectorRef, Signal } from '@angular/core';
import { signal } from '@angular/core';
import type { DataSort } from './data-sort';
import { DataBlock } from './data-block';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataOptions } from './data-options';
import { FullDataOptions, IncrementalDataOptions } from './data-options';

export class DataManager<TData> {
  constructor(private readonly cdr: ChangeDetectorRef) {}
  private dataRowHeightPx: number = 0;
  private dataWindowHeightPx: number = 0;
  private sort: DataSort[] = [];
  private dataBlockWindow: number = 0;
  private dataBlockHeightPx: number = 0;
  private blockRowCount: number = 0;
  private _totalRowCount = 0;
  public get totalRowCount() {
    return this._totalRowCount;
  }
  private dataOptions: DataOptions<TData> | undefined = undefined;
  private readonly $_blocks = signal<BlocksInfo<TData>>({
    prePixels: 0,
    blocks: [],
    postPixels: 0,
  });
  get $blocks(): Signal<BlocksInfo<TData>> {
    return this.$_blocks;
  }

  private readonly $_allDataInfo = signal<AllDataInfo<TData> | undefined>(undefined);
  /** The full load's state, with `FullDataOptions`; a signal, so a view or a `computed` follows each reset's */
  get $allDataInfo(): Signal<AllDataInfo<TData> | undefined> {
    return this.$_allDataInfo;
  }
  get allDataInfo(): AllDataInfo<TData> | undefined {
    return this.$_allDataInfo();
  }
  private resetting = false;
  // Each reset and destroy() starts a generation; what an older one's loads answer after it is dropped, so a reset
  // that a newer one overtook writes nothing the newer one owns
  private generation = 0;
  public async reset(dataWindowHeightPx: number, dataRowHeightPx: number, sort: DataSort[], dataBlockWindow: number, dataOptions: DataOptions<TData>) {
    const generation = ++this.generation;
    this.resetting = true;
    this.dataOptions = dataOptions;
    this.dataRowHeightPx = dataRowHeightPx;
    this.dataWindowHeightPx = dataWindowHeightPx;
    this.sort = sort;
    this.dataBlockWindow = dataBlockWindow;
    this.blockRowCount = Math.floor(dataWindowHeightPx / dataRowHeightPx);
    this.dataBlockHeightPx = dataRowHeightPx * this.blockRowCount;
    this._totalRowCount = 0;

    this.$_allDataInfo()?.abort.abort();
    this.$_allDataInfo.set(undefined);

    if (!Number.isFinite(this.blockRowCount) || this.blockRowCount <= 0) {
      this.showBlocks({
        prePixels: 0,
        blocks: [],
        postPixels: 0,
      });
      this.resetting = false;
      return;
    }

    let initialBlock: DataBlock<TData> | undefined = undefined;
    if (this.dataOptions instanceof IncrementalDataOptions) {
      initialBlock = this.getBlock(0);
    } else if (this.dataOptions instanceof FullDataOptions) {
      const allDataAbort = new AbortController();
      const options = this.dataOptions;
      const allDataPromise = options
        .getAllData({
          sort: sort,
          abort: allDataAbort.signal,
        })
        .then(response => {
          if (generation === this.generation) {
            this._totalRowCount = response.data.length;
          }
          return response.data.map(row => ({
            key: options.getRowKey(row),
            data: row,
          }));
        });
      this.$_allDataInfo.set(new AllDataInfo<TData>(allDataPromise, allDataAbort));
      initialBlock = this.getBlock(0);
    } else {
      this.resetting = false;
      throw new Error('Unsupported data options type');
    }

    // load initial block
    this.showBlocks({
      prePixels: 0,
      blocks: [initialBlock],
      postPixels: 0,
    });
    this.cdr.markForCheck();

    try {
      await initialBlock.dataPromise;
    } catch (error: unknown) {
      if (generation !== this.generation) {
        return;
      }
      console.error('Error loading initial data block:', error);
      this.cdr.markForCheck();
      this.resetting = false;
      return;
    }
    if (generation !== this.generation) {
      return;
    }
    this.cdr.markForCheck();
    this.resetting = false;
    this.setScrollPosition(0);
  }

  /** Cancels every load and drops what they would answer; for a component that is destroyed */
  destroy() {
    this.generation++;
    this.$_allDataInfo()?.abort.abort();
    for (const block of this.$_blocks().blocks) {
      block.abort?.abort();
    }
  }

  private getBlock(blockId: number): DataBlock<TData> {
    const generation = this.generation;
    const options = this.dataOptions!;
    const allDataInfo = this.$_allDataInfo();
    if (allDataInfo) {
      // we are using full data
      const blockPromise = allDataInfo.promise.then(data => {
        return data.slice(blockId * this.blockRowCount, (blockId + 1) * this.blockRowCount);
      });
      // aborted with the full load, so the block is cancelled, not failed, when a newer load replaces that one
      const blockAbort = new AbortController();
      allDataInfo.abort.signal.addEventListener(
        'abort',
        () => {
          blockAbort.abort();
        },
        { once: true },
      );
      return new DataBlock<TData>(blockId, blockAbort, this.blockRowCount, options.getRowKey, blockPromise);
    } else {
      // we are using incremental data
      const blockAbort = new AbortController();
      let blockPromise: Promise<{ key: Primitive; data: TData }[]>;
      if (!Number.isFinite(this.blockRowCount)) {
        blockPromise = Promise.resolve([]);
      } else {
        blockPromise = (options as IncrementalDataOptions<TData>)
          .getDataBlock({
            offset: blockId * this.blockRowCount,
            count: this.blockRowCount,
            sort: this.sort,
            abort: blockAbort.signal,
          })
          .then(response => {
            if (generation === this.generation) {
              this._totalRowCount = response.total;
            }
            return response.data.map(row => ({
              key: options.getRowKey(row),
              data: row,
            }));
          })
          .then(data => {
            if (data.length > this.blockRowCount) {
              console.warn(`Data block received unexpected data: count ${data.length}, expected max count ${this.blockRowCount}`);
              throw new Error(`Data block received unexpected data: count ${data.length}, expected max count ${this.blockRowCount}`);
            }
            return data;
          });
      }
      return new DataBlock<TData>(blockId, blockAbort, this.blockRowCount, options.getRowKey, blockPromise);
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

    const blocks: DataBlock<TData>[] = this.$_blocks().blocks.filter(block => blockIdsToLoad.includes(block.id));
    for (const blockId of blockIdsToLoad) {
      if (!blocks.some(b => b.id === blockId)) {
        blocks.push(this.getBlock(blockId));
      }
    }
    blocks.sort((a, b) => a.id - b.id);

    // rows before the first block
    const prePixels = blocks.length === 0 ? 0 : blocks[0].id * this.dataBlockHeightPx;
    // rows after the last block
    const lastBlock = blocks.length === 0 ? undefined : blocks[blocks.length - 1];
    const preAndDisplayedRowsCount = (lastBlock?.offset ?? 0) + this.blockRowCount;
    const postRowsCount = this.totalRowCount - preAndDisplayedRowsCount;
    this.showBlocks({
      prePixels,
      blocks,
      postPixels: Math.max(0, postRowsCount) * this.dataRowHeightPx,
    });
  }

  // A new object each time, so the view and any computed see the change; the blocks it drops are cancelled once it is
  // set, since a cancel can run change detection, which then reads the new blocks
  private showBlocks(next: BlocksInfo<TData>) {
    const dropped = this.$_blocks().blocks.filter(block => !next.blocks.includes(block));
    this.$_blocks.set(next);
    for (const block of dropped) {
      block.abort?.abort();
    }
  }
}

export interface BlocksInfo<TData> {
  prePixels: number;
  blocks: DataBlock<TData>[];
  postPixels: number;
}

export class AllDataInfo<TData> {
  private readonly $_allKeys = signal<Set<Primitive>>(new Set<Primitive>());
  get $allKeys(): Signal<Set<Primitive>> {
    return this.$_allKeys;
  }
  private readonly $_status = signal<'canceled' | 'error' | 'loading' | 'success'>('loading');
  get $status(): Signal<'canceled' | 'error' | 'loading' | 'success'> {
    return this.$_status;
  }
  constructor(
    public readonly promise: Promise<{ key: Primitive; data: TData }[]>,
    public readonly abort: AbortController,
  ) {
    promise
      .then(data => {
        this.$_allKeys.set(new Set(data.map(item => item.key)));
        this.$_status.set('success');
      })
      .catch((error: unknown) => {
        // a cancelled load is no error: a newer load replaced it
        if (this.abort.signal.aborted) {
          this.$_status.set('canceled');
          return;
        }
        this.$_status.set('error');
        console.error('Error loading all data:', error);
        throw error;
      });
  }
}
