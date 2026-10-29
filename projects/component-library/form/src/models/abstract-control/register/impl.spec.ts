import { ChangeDetectionStrategy, Component, createEnvironmentInjector, DestroyRef, EnvironmentInjector } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TableauUiFormModule } from '../../../tableau-ui-form.module';
import { FB } from '../../fb';
import type { FC } from '../../form-control/interfaces';

type Profile = {
  name: string;
  nickname?: string;
};

describe('registerFn', () => {
  const fb = new FB();

  function scope() {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    return { destroyRef: injector.get(DestroyRef), destroy: () => injector.destroy() };
  }

  // F14: a callback lived as long as the form, so a form that outlived its component gained one per open
  it('stops calling each callback once the DestroyRef it was given is destroyed', () => {
    const form = fb.group<Profile>({ name: fb.control<string>('Ada'), nickname: fb.control<string | undefined>(undefined) });
    const calls: string[] = [];
    const { destroyRef, destroy } = scope();
    form.controls.name.registerFn.valueChange(() => calls.push('valueChange'), false, false, destroyRef);
    form.registerFn.valueChange(() => calls.push('group valueChange'), false, false, destroyRef);
    form.registerFn.childChange(
      controls => controls.name,
      () => calls.push('childChange'),
      false,
      false,
      destroyRef,
    );
    form.controls.name.registerFn.metaChange(() => calls.push('metaChange'), destroyRef);
    form.controls.name.registerFn.enableChange(() => calls.push('enableChange'), destroyRef);
    calls.length = 0;

    destroy();
    form.controls.name.setValue('Grace');
    form.controls.name.metaFn.disable();

    expect(calls).toEqual([]);
  });

  // F21: childChange and formControlValue rejected FC<T | undefined>, which an optional field is, under strict types
  it('takes an optional field in childChange and formControlValue', async () => {
    @Component({
      imports: [AsyncPipe, TableauUiFormModule],
      template: `{{ nickname | formControlValue | async }}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class NicknameComponent {
      readonly form = fb.group<Profile>({ name: fb.control<string>('Ada'), nickname: fb.control<string | undefined>('Countess') });
      readonly nickname: FC<string | undefined> = this.form.controls.nickname;
    }
    const fixture = TestBed.createComponent(NicknameComponent);
    fixture.autoDetectChanges();
    const seen: (string | undefined)[] = [];
    fixture.componentInstance.form.registerFn.childChange(
      controls => controls.nickname,
      (_group, _control, value) => seen.push(value),
    );
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent.trim()).toBe('Countess');
    expect(seen).toEqual(['Countess']);
  });
});
