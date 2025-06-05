import { computed, Signal, signal } from '@angular/core';
import { DataSort } from '../sorting/data-sort';
import { DataRequest } from './data-request';
import { DataResponse } from './data-response';

export class DataBlock {
    private _status = signal<
        'idle' | 'loading' | 'success' | 'error' | 'canceled'
    >('idle');
    public get status(): Signal<
        'idle' | 'loading' | 'success' | 'error' | 'canceled'
    > {
        return this._status;
    }
    private _response = signal<DataResponse | undefined>(undefined);
    public get response(): Signal<DataResponse | undefined> {
        return this._response;
    }
    public data = computed(() => {
        const status = this.status();
        const response = this.response();
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
        private readonly request: (req: DataRequest) => Promise<DataResponse>
    ) {}

    public async load(): Promise<boolean> {
        if (this.status() === 'loading' || this.status() === 'success') {
            return true;
        }
        try {
            this._status.set('loading');
            this._response.set(undefined);
            const data = await this.request({
                offset: this.offset,
                count: this.count,
                sort: this.sort,
                abort: this.abort.signal,
            });

            if (data.offset !== this.offset || data.count > this.count) {
                console.warn(
                    `Data block ${this.id} received unexpected data: offset ${data.offset}, count ${data.count}, expected offset ${this.offset}, count ${this.count}`
                );
                this._status.set('error');
                return false;
            }

            this._response.set(data);
            this._status.set('success');
            return true;
        } catch (error) {
            if (this.abort.signal.aborted) {
                this._status.set('canceled');
                return false;
            }
            this._status.set('error');
            console.error('Error loading data block:', error);
            return false;
        }
    }
    public destroy() {
        this.abort.abort();
        this._status.set('idle');
        this._response.set(undefined);
    }
}
