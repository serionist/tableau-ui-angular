import { AbstractControl } from '@angular/forms';

export class ControlRegistry {
    private static currentId: number = 0;
    private static _controls: Map<number, AbstractControl> = new Map<number, AbstractControl>();
    public static get controls(): ReadonlyMap<number, AbstractControl> {
        return this._controls as ReadonlyMap<number, AbstractControl>;
    }

    public static register(control: AbstractControl): number {
        const id = this.currentId++;
        this._controls.set(id, control);
        return id;
    }
    public static unregister(id: number): void {
        this._controls.delete(id);
    }
}
