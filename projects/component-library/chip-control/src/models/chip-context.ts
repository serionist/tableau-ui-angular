import type { ChipControlComponent } from "../components/chip-control.component";
import type { ChipData } from "./chip-data";

export interface ChipContext<TKey, TValue> {
    data: ChipData<TKey, TValue>;
    chipControl: ChipControlComponent<TKey, TValue>;
    selected: boolean;
}