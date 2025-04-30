import {
    AbstractControl,
    ControlEvent,
    FormArray,
    FormBuilder,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormGroupDirective,
    FormResetEvent,
    FormSubmittedEvent,
    NgForm,
    PristineChangeEvent,
    StatusChangeEvent,
    TouchedChangeEvent,
    ValidationErrors,
} from '@angular/forms';
import {
    distinct,
    distinctUntilChanged,
    filter,
    map,
    Observable,
    of,
    startWith,
    switchMap,
} from 'rxjs';
import { FormControlPipe } from './form-control.pipe';
import { Primitive } from './types/primitive';
import { DeepPartial, IAbstractControlWithRef } from './public-api';
export class FormHelper {
    public static getFormControl(
        form: AbstractControl,
        parts: string[]
    ): Observable<AbstractControl | null> {
        const key = parts.shift();
        if (key === undefined) {
            return of(form);
        }
        if (form instanceof FormArray) {
            const index = parseInt(key, 10);
            if (isNaN(parseInt(key, 10))) {
                return of(null);
            }
            return FormHelper.getArrayValue$(form).pipe(
                switchMap((controls) =>
                    FormHelper.getFormControl(controls[index], parts)
                )
            );
        }
        if (form instanceof FormGroup) {
            const control = form.get(key);
            if (!control) {
                return of(null);
            }
            return FormHelper.getFormControl(control, parts).pipe(
                map((c) => c)
            );
        }
        return of(null);
    }
    public static updateAllValidation(
        f: AbstractControl,
        markAsTouched = true
    ) {
        if (markAsTouched) {
            f.markAsTouched();
        }
        f.updateValueAndValidity();
        if (f instanceof FormGroup) {
            for (let childKey of Object.keys(f.controls)) {
                this.updateAllValidation(f.controls[childKey]);
            }
        } else if (f instanceof FormArray) {
            for (let i = 0; i < f.controls.length; i++) {
                this.updateAllValidation(f.controls[i]);
            }
        }
    }

    public static async isInvalid(ctrl: AbstractControl) {
        if (ctrl.status === 'INVALID') {
            return true;
        }
        if (ctrl.status === 'PENDING') {
            return new Promise<boolean>(resolve => {
                const sub = ctrl.statusChanges.pipe(startWith(ctrl.status), distinct()).subscribe(s => {
                    if (s === 'INVALID') {
                        resolve(true);
                        sub.unsubscribe();
                    } else if (s !== 'PENDING') {
                        resolve(false);
                        sub.unsubscribe();
                    }
                });
            });
        }
        return false;
    }
    public static getMeta$(
        ctrl: AbstractControl,
        fireInitial = true,
        listenFor: (
            | 'touched'
            | 'status'
            | 'pristine'
            | 'submitted'
            | 'reset'
        )[] = ['touched', 'status']
    ): Observable<AbstractControlMeta> {
        return ctrl.events.pipe(
            map((event: ControlEvent) => {
                if (
                    event instanceof TouchedChangeEvent &&
                    !listenFor.includes('touched')
                ) {
                    return null;
                } else if (
                    event instanceof StatusChangeEvent &&
                    !listenFor.includes('status')
                ) {
                    return null;
                } else if (
                    event instanceof PristineChangeEvent &&
                    !listenFor.includes('pristine')
                ) {
                    return null;
                } else if (
                    event instanceof FormSubmittedEvent &&
                    !listenFor.includes('submitted')
                ) {
                    return null;
                } else if (
                    event instanceof FormResetEvent &&
                    !listenFor.includes('reset')
                ) {
                    return null;
                }
                return AbstractControlMeta.fromControl(ctrl);
            }),
            startWith(
                fireInitial ? AbstractControlMeta.fromControl(ctrl) : null
            ),
            filter((e) => e != null),
            distinctUntilChanged((a, b) => AbstractControlMeta.compare(a, b))
        );
    }

    public static getArrayValue$<TControl extends AbstractControl<any>>(
        fa: FormArray<TControl>,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<TControl[]> {
        let baseObs = fa.statusChanges;
        if (fireInitial) {
            baseObs = baseObs.pipe(startWith(fa.status));
        }
        let obs = baseObs.pipe(
            map(() => fa.controls.map((e) => e as TControl))
        );
        if (onlyChangedValues) {
            obs = obs.pipe(
                distinctUntilChanged((a, b) => {
                    const aArr = a as TControl[];
                    const bArr = b as TControl[];
                    if (aArr.length !== bArr.length) {
                        return false;
                    }
                    for (let i = 0; i < a.length; i++) {
                        const ai = a[i] as any;
                        const bi = b[i] as any;
                        if (ai?.ref?.id && bi?.ref?.id) {
                            if (ai.ref.id !== bi.ref.id) {
                                return false;
                            }
                        } else {
                            if (ai !== bi) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
            );
        }
        return obs;
    }
    public static getGroupValue$<T extends Record<string, any>>(
        ctrl: FormGroup<T>,
        fireInitial = true,
        onlyChangedValues = true
    ): Observable<DeepPartial<T>> {
        let obs = ctrl.valueChanges.pipe();
        if (fireInitial) {
            obs = obs.pipe(startWith(ctrl.value));
        }
        if (onlyChangedValues) {
            obs = obs.pipe(
                distinctUntilChanged((a, b) => {
                    if (!a && !b) {
                        return true;
                    }
                    if (!a || !b) {
                        return false;
                    }
                    if (typeof a === 'object' && typeof b === 'object') {
                        try {
                            return JSON.stringify(a) === JSON.stringify(b);
                        } catch (e) {
                            return false;
                        }
                    }
                    return a === b;
                })
            );
        }
        return obs;
    }
    public static getValue$<T extends Primitive | Primitive[]>(
        ctrl: FormControl<T>,
        fireInitial = true,
        onlyChangedValues = true,
        log = false
    ): Observable<T> {
        let obs = ctrl.valueChanges.pipe(startWith(ctrl.value));
        if (fireInitial) {
            obs = obs.pipe(startWith(ctrl.value));
        }
        if (log) {
            obs = obs.pipe(
                map((v) => {
                    console.log('getValue$ changed:', v);
                    return v;
                })
            );
        }
        if (onlyChangedValues) {
            obs = obs.pipe(
                distinctUntilChanged((a, b) => {
                    if (!a && !b) {
                        return true;
                    }
                    if (!a || !b) {
                        return false;
                    }
                    if (Array.isArray(a) && Array.isArray(b)) {
                        if (a.length !== b.length) {
                            return false;
                        }
                        for (let i = 0; i < a.length; i++) {
                            if (a[i] !== b[i]) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return a === b;
                })
            );
        }
        if (log) {
            obs = obs.pipe(
                map((v) => {
                    console.log('geValue$ changed after distinct:', v);
                    return v;
                })
            );
        }
        return obs;
    }
}

export class AbstractControlMeta {
    private constructor(
        public type: 'formControl' | 'formGroup' | 'formArray',
        public touched: boolean,
        public untouched: boolean,
        public validity: FormControlStatus,
        public dirty: boolean,
        public pristine: boolean,
        public enabled: boolean,
        public disabled: boolean,
        public errors: ValidationErrors | null,
        public childControls: AbstractControlMeta[] | undefined
    ) {}

    static fromControl(control: AbstractControl): AbstractControlMeta {
        let childControls: AbstractControlMeta[] | undefined = undefined;
        let type: 'formControl' | 'formGroup' | 'formArray' = 'formControl';
        if (control instanceof FormGroup) {
            type = 'formGroup';
            childControls = Object.keys(control.controls).map((k) =>
                AbstractControlMeta.fromControl(control.controls[k])
            );
        } else if (control instanceof FormArray) {
            type = 'formArray';
            childControls = control.controls.map((c) =>
                AbstractControlMeta.fromControl(c)
            );
        }
        return new AbstractControlMeta(
            type,
            control.touched,
            control.untouched,
            control.status,
            control.dirty,
            control.pristine,
            control.enabled,
            control.disabled,
            control.errors,
            childControls
        );
    }

    hasError(errorCode?: string, requireTouched = true): boolean {
        return AbstractControlMeta._hasError(this, errorCode, requireTouched);
    }
    getErrorValue(errorCode: string, requireTouched = true): any | undefined {
        return AbstractControlMeta._getErrorValue(
            this,
            errorCode,
            requireTouched
        );
    }

    private static _hasError(
        meta?: AbstractControlMeta,
        errorCode?: string,
        requireTouched = true
    ): boolean {
        if (!meta) {
            return false;
        }
        if (
            (!requireTouched || meta.touched) &&
            meta.errors &&
            (!errorCode
                ? Object.keys(meta.errors).length > 0
                : errorCode in meta.errors)
        ) {
            return true;
        }
        if (meta.childControls) {
            return meta.childControls.some((c) =>
                this._hasError(c, errorCode, requireTouched)
            );
        }
        return false;
    }
    private static _getErrorValue(
        meta: AbstractControlMeta,
        errorCode: string,
        requireTouched = true
    ): any | undefined {
        if (!meta) {
            return undefined;
        }
        if (
            (!requireTouched || meta.touched) &&
            meta.errors &&
            errorCode in meta.errors
        ) {
            return meta.errors[errorCode];
        }
        if (meta.childControls) {
            for (const c of meta.childControls) {
                const value = this._getErrorValue(c, errorCode, requireTouched);
                if (value) {
                    return value;
                }
            }
        }
        return undefined;
    }

    public static compare(
        a: AbstractControlMeta,
        b: AbstractControlMeta
    ): boolean {
        const baseEqual =
            a.touched === b.touched &&
            a.untouched === b.untouched &&
            a.validity === b.validity &&
            a.dirty === b.dirty &&
            a.pristine === b.pristine &&
            a.enabled === b.enabled &&
            a.disabled === b.disabled &&
            this.validationErrorsEqual(a.errors, b.errors);
        if (!baseEqual) {
            return false;
        }
        if (!a.childControls && !b.childControls) {
            return true;
        }
        if (!a.childControls || !b.childControls) {
            return false;
        }
        if (a.childControls.length !== b.childControls.length) {
            return false;
        }
        for (let i = 0; i < a.childControls.length; i++) {
            if (!this.compare(a.childControls[i], b.childControls[i])) {
                return false;
            }
        }
        return true;
    }
    private static validationErrorsEqual(
        a: ValidationErrors | null,
        b: ValidationErrors | null
    ): boolean {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        for (const key of aKeys) {
            if (!(key in b)) {
                return false;
            }
            if (typeof a[key] !== typeof b[key]) {
                return false;
            }
            if (typeof a[key] === 'object') {
                if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
                    return false;
                }
            } else {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
        }
        return true;
    }
}
