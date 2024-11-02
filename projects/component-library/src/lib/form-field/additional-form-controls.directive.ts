import {
    Directive,
    ElementRef,
    inject,
    input,
    model,
    OnDestroy,
    OnInit,
    Renderer2,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlContainer,
    FormArray,
    FormGroup,
    NgControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[additionalValidationFormControls]',
})
export class AdditionalValidationFormControlsDirective implements OnDestroy, OnInit {
    el = inject(ElementRef);
    renderer = inject(Renderer2);
    controlDir = inject(NgControl, { optional: true });

    controls = model<AbstractControl[]>([], {
        alias: 'additionalValidationFormControls',
    });

    constructor() {
        toObservable(this.controls).subscribe((controls) => {
            const allControls: AbstractControl[] = [];
            if (this.controlDir && this.controlDir.control) {
                allControls.push(this.controlDir.control);
            }
            allControls.push(...controls);
            this.unInitSubs();

            allControls.forEach((control) =>
                this.trackControl(control, allControls)
            );
        });

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class'
                ) {
                    this.setClasses();
                }
            });
        });

        this.observer.observe(this.el.nativeElement, { attributes: true });
    }
    private observer: MutationObserver;
    ngOnInit(): void {}
    private subscriptions: Subscription[] = [];
    private unInitSubs() {
        // Clean up subscriptions
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];
    }
    ngOnDestroy(): void {
        this.observer.disconnect();
        this.unInitSubs();
    }

    private trackControl(
        control: AbstractControl,
        allControls: AbstractControl[]
    ) {
        // Subscribe to statusChanges and valueChanges to track dirty, touched, and error state
        const statusSub = control.statusChanges.subscribe(() =>
            this.updateClasses(allControls)
        );
        const valueSub = control.valueChanges.subscribe(() =>
            this.updateClasses(allControls)
        );

        this.subscriptions.push(statusSub, valueSub);

        // Recursively handle nested controls in FormGroup or FormArray
        if (control instanceof FormGroup || control instanceof FormArray) {
            Object.values(control.controls).forEach((childControl) =>
                this.trackControl(childControl, allControls)
            );
        }
        this.updateClasses(allControls);
    }

    classes = {
        isDirty: false,
        isTouched: false,
        invalid: true,
    };

    private updateClasses(allControls: AbstractControl[]) {
        // Check if any control in the hierarchy has the dirty, touched, or error state
        this.classes.isDirty = allControls.some((control) =>
            this.checkRecursive(control, 'dirty')
        );
        this.classes.isTouched = allControls.some((control) =>
            this.checkRecursive(control, 'touched')
        );
        this.classes.invalid = allControls.some((control) =>
            this.checkRecursive(control, 'invalid')
        );
        this.setClasses();
    }

    private checkRecursive(
        control: AbstractControl,
        state: 'dirty' | 'touched' | 'invalid'
    ): boolean {
        // Check if the control itself is in the desired state
        if (control[state]) {
            return true;
        }

        // Recursively check nested controls for FormGroup and FormArray
        if (control instanceof FormGroup || control instanceof FormArray) {
            return Object.values(control.controls).some((childControl) =>
                this.checkRecursive(childControl, state)
            );
        }

        return false;
    }

    private setClasses() {
        this.setDirtyClasses(this.classes.isDirty);
        this.setTouchedClasses(this.classes.isTouched);
        this.setInvalidClasses(this.classes.invalid);
    }

    private setDirtyClasses(isDirty: boolean) {
        const dirtyClass = 'ng-dirty';
        const pristineClass = 'ng-pristine';
        if (isDirty) {
            if (
                !this.el.nativeElement.classList.contains(pristineClass) &&
                this.el.nativeElement.classList.contains(dirtyClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(pristineClass);
            this.el.nativeElement.classList.add(dirtyClass);
        } else {
            if (
                !this.el.nativeElement.classList.contains(dirtyClass) &&
                this.el.nativeElement.classList.contains(pristineClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(dirtyClass);
            this.el.nativeElement.classList.add(pristineClass);
        }
    }
    private setTouchedClasses(isTouched: boolean) {
        const touchedClass = 'ng-touched';
        const untouchedClass = 'ng-untouched';
        if (isTouched) {
            if (
                !this.el.nativeElement.classList.contains(untouchedClass) &&
                this.el.nativeElement.classList.contains(touchedClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(untouchedClass);
            this.el.nativeElement.classList.add(touchedClass);
        } else {
            if (
                !this.el.nativeElement.classList.contains(touchedClass) &&
                this.el.nativeElement.classList.contains(untouchedClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(touchedClass);
            this.el.nativeElement.classList.add(untouchedClass);
        }
    }
    private setInvalidClasses(hasError: boolean) {
        const errorClass = 'ng-invalid';
        const validClass = 'ng-valid';
        if (hasError) {
            if (
                !this.el.nativeElement.classList.contains(validClass) &&
                this.el.nativeElement.classList.contains(errorClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(validClass);
            this.el.nativeElement.classList.add(errorClass);
        } else {
            if (
                !this.el.nativeElement.classList.contains(errorClass) &&
                this.el.nativeElement.classList.contains(validClass)
            ) {
                return;
            }
            this.el.nativeElement.classList.remove(errorClass);
            this.el.nativeElement.classList.add(validClass);
        }
    }
}
