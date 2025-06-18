import type { WritableSignal } from '@angular/core';
import { signal, type Signal } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, firstValueFrom, map, type Observable, type Subscription } from 'rxjs';
import type { Hierarchy } from './hierarchy/interfaces';
import type { AC } from './interfaces';
import type { Meta, MetaFns } from './meta/interfaces';
import type { RegisterFns } from './register/interfaces';
import type { ValidatorFns } from './validation/interfaces';
import type { AbstractControl } from '@angular/forms';
import { HierarchyImpl } from './hierarchy/impl';
import { MetaImpl } from './meta/impl';

export abstract class ACImpl<TValue> implements AC {
    readonly type: 'array' | 'control' | 'group';
    readonly control: AbstractControl;
    protected subscriptions: Subscription[] = [];

    readonly meta$: BehaviorSubject<Meta>;
    readonly $meta: WritableSignal<Meta>;

    public abstract readonly value$: Observable<unknown>;
    public abstract readonly $value: Signal<unknown>;
    public abstract readonly  defaultValue: unknown;

    
    public abstract submitted$: Observable<unknown>;
    public abstract reset$: Observable<unknown>;
    // readonly rawValue$: ReadonlyBehaviorSubject<unknown>;
    // readonly $rawValue: Signal<unknown>;

    readonly hierarchy: Hierarchy;
    public abstract readonly validatorFn: ValidatorFns;
    public abstract readonly metaFn: MetaFns;
    public abstract readonly registerFn: RegisterFns;
    constructor(type: 'array' | 'control' | 'group', control: AbstractControl, childList: AC[] = []) {
        this.control = control;
        this.hierarchy = new HierarchyImpl(this, childList);

        this.subscriptions.push(
            this.hierarchy.childList$.subscribe((ch) => {
                ch.forEach((c) => {
                    (c.hierarchy as HierarchyImpl).parent = this;
                });
            }),
        );
        this.type = type;
        const initialMeta = MetaImpl.fromControl(this);
        this.meta$ = new BehaviorSubject<Meta>(initialMeta);
        this.$meta = signal<Meta>(initialMeta);
        this.subscriptions.push(
            this.control.events
                .pipe(
                    map(() => MetaImpl.fromControl(this)),
                    distinctUntilChanged((a, b) => MetaImpl.compare(a, b)),
                )
                .subscribe((meta) => {
                    this.meta$.next(meta);
                    this.$meta.set(meta);
                }),
        );
    }
    
   
    public getRawValue(): TValue {
        return this.control.getRawValue() as TValue;
    }
    // public setValue(
    //     value: TValue,
    //     options?: {
    //         onlySelf?: boolean;
    //         emitEvent?: boolean;
    //         emitModelToViewChange?: boolean;
    //         emitViewToModelChange?: boolean;
    //     },
    // ) {
    //     this.control.setValue(value, options);
    // }
    public async isInvalid() {
        return firstValueFrom(
            this.meta$.pipe(
                map((e) => {
                    if (e.validity === 'INVALID') {
                        return true;
                    } else if (e.validity !== 'PENDING') {
                        return false;
                    }
                    return undefined;
                }),
                filter((e) => e !== undefined),
            ),
        );
    }

    public updateValueAndValidity(includeAncestors: boolean, includeDescendants: boolean, markAsTouched: boolean, markAsDirty: boolean, emitEvent: boolean = true): void {
        ACImpl._updateValueAndValidity(this, includeAncestors, includeDescendants, markAsTouched, markAsDirty, emitEvent);
    }
    private static _updateValueAndValidity(f: ACImpl<unknown>, includeAncestors: boolean, includeDescendants: boolean, markAsTouched: boolean, markAsDirty: boolean, emitEvent: boolean) {
        if (includeDescendants) {
            for (const child of f.hierarchy.childList$.value) {
                this._updateValueAndValidity(child as ACImpl<unknown>, false, includeDescendants, markAsTouched, markAsDirty, emitEvent);
            }
        }

        if (markAsTouched) {
            f.control.markAsTouched({ onlySelf: true, emitEvent: false });
        }
        if (markAsDirty) {
            f.control.markAsDirty({ onlySelf: true, emitEvent: false });
        }
        f.control.updateValueAndValidity({ onlySelf: true, emitEvent });
        if (includeAncestors) {
            let { parent } = f.hierarchy;
            while (parent) {
                this._updateValueAndValidity(parent as ACImpl<unknown>, false, false, markAsTouched, markAsDirty, emitEvent);
                parent = parent.hierarchy.parent;
            }
        }
    }
    destroy(): void {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
        this.subscriptions.length = 0;
        this.hierarchy.childList$.value.forEach((child) => {
            child.destroy();
        });
    }
}
