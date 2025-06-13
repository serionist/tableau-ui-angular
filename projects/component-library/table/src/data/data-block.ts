import type { Signal } from '@angular/core';
import { computed, signal } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';

export class DataBlock<TData, TKey extends Primitive> {
    private readonly $_status = signal<'canceled' | 'error' | 'loading' | 'success'>('loading');
    public get $status(): Signal<'canceled' | 'error' | 'loading' | 'success'> {
        return this.$_status;
    }
    private readonly $response = signal<{key: TKey, data: TData}[]>([]);
    public readonly $data = computed(() => {
        const status = this.$status();
        const response = this.$response();
        if (status === 'success') {
            return response;
        } else {
            const row: Record<string, unknown> = {};
            this.displayedColumns.forEach((col) => {
                row[col] = undefined;
            });
            return Array.from({ length: Number.isFinite(this.blockRowCount) ? this.blockRowCount : 0 }, (_, a) => ({
                key: a,
                data: row as TData,
            }));
        }
    });
    public get offset() {
        return this.id * this.blockRowCount;
    }
    constructor(
        public readonly id: number,
        private readonly displayedColumns: string[],
        public readonly abort: AbortController | undefined,
        private readonly blockRowCount: number,
        private readonly getKey: (data: TData) => TKey,
        public readonly dataPromise: Promise<{key: TKey, data: TData}[]>,
    ) {
        this.dataPromise
            .then((data) => {
                this.$response.set(data);
                this.$_status.set('success');
            })
            .catch((error: unknown) => {
                if (this.abort?.signal.aborted === true) {
                    this.$_status.set('canceled');
                    return;
                }
                this.$_status.set('error');
                console.error('Error loading data block:', error);

                throw error;
            });
    }
}
