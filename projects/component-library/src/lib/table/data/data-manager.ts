import { Signal, signal } from "@angular/core";
import { DataSort } from "../sorting/data-sort";
import { DataBlock } from "./data-block";
import { DataRequest } from "./data-request";

export class DataManager {
    
    private blockRowCount: number = 0;
    private getDataBlock: (req: DataRequest) => Record<string, unknown>[] | Error = undefined!;
    private _initialLoading = signal<boolean>(false);
    public get initialLoading(): Signal<boolean> { return this._initialLoading; }

    private _blocks = signal<BlocksInfo>({
        prePixels: 0,
        blocks: [],
        postPixels: 0
    });
    get blocks(): Signal<BlocksInfo> { return this._blocks; }

    public reset(dataWindowHeightPx: number, dataRowHeightPx: number, sort: DataSort[], getDataBlock: (req: DataRequest) => Record<string, unknown>[] | Error) {
       this.getDataBlock = getDataBlock;

        this.blockRowCount = Math.floor(dataWindowHeightPx / dataRowHeightPx);


        console.log('Data Manager initialized with window height', dataWindowHeightPx, dataRowHeightPx, sort, this.blockRowCount);

        this._initialLoading.set(true);
    }
}

export interface BlocksInfo {
    prePixels: number;
    blocks: DataBlock[];
    postPixels: number;
}