import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TableauUiFormModule } from '../../../tableau-ui-form.module';
import { FB } from '../../fb';

@Component({
  imports: [ReactiveFormsModule, TableauUiFormModule],
  template: `<input aria-label="Id" [formControl]="form | formControl: 'id'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LockedFieldComponent {
  private readonly fb = new FB();
  readonly form = this.fb.group<{ name: string; id: string }>({
    name: this.fb.control<string>('Ada'),
    id: this.fb.control<string>('7').registerFn.alwaysDisabled(),
  });
}

describe('alwaysDisabled', () => {
  // F10: it disabled the control again inside enable()'s own event, and Angular then enabled the element after it
  it('keeps the control and its element disabled after its form is disabled and enabled', async () => {
    const fixture = TestBed.createComponent(LockedFieldComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const { form } = fixture.componentInstance;
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.disabled).toBe(true);

    form.metaFn.disable();
    form.metaFn.enable();
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
    expect(form.controls.id.$meta().disabled).toBe(true);
    expect(form.$value()).toEqual({ name: 'Ada' });
  });

  // F10: the meta signal was set after the subject emitted, so a callback that changed the control left it stale; and
  // a later subscriber got the nested change first and the stale meta last
  it('keeps $meta and every subscriber in step when a meta callback changes the control', () => {
    const fb = new FB();
    const control = fb.control('a', undefined, undefined, true);
    control.registerFn.metaChange(meta => {
      if (meta.enabled) {
        control.metaFn.disable();
      }
    });
    const enabled: boolean[] = [];
    control.registerFn.metaChange(meta => enabled.push(meta.enabled));

    control.metaFn.enable();

    expect(control.meta$.value.disabled).toBe(true);
    expect(control.$meta().disabled).toBe(true);
    expect(enabled).toEqual([false, true, false]);
  });
});
