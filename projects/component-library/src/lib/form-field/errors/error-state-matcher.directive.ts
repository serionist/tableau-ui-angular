import {
    Directive,
    DoCheck,
    ElementRef,
    inject,
    input,
    model,
    Renderer2,
    signal,
} from '@angular/core';
import {
    AbstractControl,
    FormGroupDirective,
    NgControl,
    NgForm,
} from '@angular/forms';

@Directive({
    selector: '[errorStateMatcher]',
})
export class ErrorStateMatcherDirective implements DoCheck {
    ngControl = inject(NgControl, { optional: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    errorStateMatcher = input<
        (
            control: AbstractControl | null,
            form: FormGroupDirective | NgForm | null
        ) => boolean
    >(
        (
            control: AbstractControl | null,
            form: FormGroupDirective | NgForm | null
        ) =>
            !!(
                control &&
                control.invalid &&
                (control.touched || (form && form.submitted))
            )
    );
    el = inject(ElementRef);
    renderer = inject(Renderer2);

    hasErrorState = signal(false);
    ranFirstCheck = signal(false);
    constructor() {}

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }
    updateErrorState() {
        const oldState = this.hasErrorState();
        const parent = this.parentFormGroup || this.parentForm;
       
        const matcher = this.errorStateMatcher();

        const control = this.ngControl ? this.ngControl.control : null;
        const newState = matcher(control, parent);
        if (newState !== oldState || !this.ranFirstCheck()) {
            this.ranFirstCheck.set(true);
            this.hasErrorState.set(newState);
            if (newState) {
                this.renderer.removeClass(this.el.nativeElement, 'tab-error');
            } else {
                this.renderer.addClass(this.el.nativeElement, 'tab-error');
            }
        }
    }
}
