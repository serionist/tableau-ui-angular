import type { Signal } from '@angular/core';
import { computed, signal } from '@angular/core';
import type { DataSort } from '../sorting/data-sort';
import type { DataRequest } from './data-request';
import type { DataResponse } from './data-response';

export class DataBlock {
    private readonly $_status = signal<'canceled' | 'error' | 'idle' | 'loading' | 'success'>('idle');
    public get $status(): Signal<'canceled' | 'error' | 'idle' | 'loading' | 'success'> {
        return this.$_status;
    }
    private readonly $_response = signal<DataResponse | undefined>(undefined);
    public get $response(): Signal<DataResponse | undefined> {
        return this.$_response;
    }
    public readonly $data = computed(() => {
        const status = this.$status();
        const response = this.$response();
        if (status === 'success' && response) {
            return response.data;
        } else {
            const row: Record<string, unknown> = {};
            this.displayedColumns.forEach((col) => {
                row[col] = undefined;
            });
            return Array.from({ length: this.count }, () => row);
        }
    });

    constructor(
        public readonly id: number,
        public readonly displayedColumns: string[],
        public readonly offset: number,
        public readonly count: number,
        public readonly sort: readonly DataSort[],
        public readonly abort: AbortController,
        private readonly request: (req: DataRequest) => Promise<DataResponse>,
    ) {}

    public async load() {
        if (this.$status() === 'loading' || this.$status() === 'success') {
            return;
        }
        try {
            this.$_status.set('loading');
            this.$_response.set(undefined);
            const data = await this.request({
                offset: this.offset,
                count: this.count,
                sort: this.sort,
                abort: this.abort.signal,
            });

            if (data.data.length > this.count) {
                console.warn(`Data block ${this.id} received unexpected data: count ${data.data.length}, expected max count ${this.count}`);
                this.$_status.set('error');
                return;
            }

            this.$_response.set(data);
            this.$_status.set('success');
        } catch (error) {
            if (this.abort.signal.aborted) {
                this.$_status.set('canceled');
                return;
            }
            this.$_status.set('error');
            console.error('Error loading data block:', error);
        }
    }
    public destroy() {
        this.abort.abort();
        this.$_status.set('idle');
        this.$_response.set(undefined);
    }
}
