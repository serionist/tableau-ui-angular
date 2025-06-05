export class DataBlock {
   
    constructor(public readonly id: number, public readonly offset: number, public readonly count: number, 
        public readonly abort: AbortSignal, 
    ) {

    }

}