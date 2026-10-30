import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { FB } from '../models/fb';
import { TableauUiFormModule } from '../tableau-ui-form.module';
import { FormArrayPipe } from './raw-controls/form-array.pipe';
import { FormControlPipe } from './raw-controls/form-control.pipe';
import { FormGroupPipe } from './raw-controls/form-group.pipe';

interface Tag {
  tag: string;
}
interface Signup {
  name: string;
  email: string;
  tags: Tag[];
}

// A sign-up form an app builds with FB and binds through the pipes alone
@Component({
  imports: [TableauUiFormModule, ReactiveFormsModule, AsyncPipe, JsonPipe],
  template: `
    <form [formGroup]="form | formGroup">
      <input class="name" [formControl]="form | formControl: 'name'" />
      <input class="email" [formControl]="form | formControl: 'email'" />
      @if (form | formMeta: 'email' | async | formHasError: 'email') {
        <span class="email-error">Not an email</span>
      }
      <span class="any-error">{{ form | formMeta | async | formHasError }}</span>
      <span class="any-error-untouched">{{ form | formMeta | async | formHasError: undefined : false }}</span>
      <span class="email-value">{{ form | formMeta | async | formError: 'email' : false | json }}</span>
      @for (row of form.controls.tags | formArrayControls | async; track $index) {
        <input class="tag" [formControl]="row | formControl: 'tag'" />
      }
      <span class="tag-count">{{ (form | formArray: 'tags').length }}</span>
      <span class="first-tag">{{ (form | formGroup: 'tags.0').value | json }}</span>
      <span class="value">{{ form | formGroupValue | async | json }}</span>
      <span class="raw">{{ form | formGroupValue: 'raw' | async | json }}</span>
      <span class="name-value">{{ form.controls.name | formControlValue | async }}</span>
      <span class="tags-value">{{ form.controls.tags | formArrayValue | async | json }}</span>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SignupComponent {
  private readonly fb = new FB();
  readonly form = this.fb.group<Signup>({
    name: this.fb.control<string>('Ada', [Validators.minLength(2)]),
    email: this.fb.control<string>('', [Validators.email]),
    tags: this.fb.array<Tag>([this.tag('math')]),
  });

  tag(tag: string) {
    return this.fb.group<Tag>({ tag: this.fb.control<string>(tag) });
  }
}

describe('the form pipes', () => {
  async function render() {
    const fixture = TestBed.createComponent(SignupComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const text = (name: string) => host.querySelector(`.${name}`)?.textContent.trim();
    const json = (name: string) => JSON.parse(text(name)!) as unknown;
    return { fixture, host, form: fixture.componentInstance.form, component: fixture.componentInstance, text, json };
  }

  it("bind a group's controls by path, both ways", async () => {
    const { fixture, host, form } = await render();
    const name = host.querySelector<HTMLInputElement>('.name')!;
    expect(name.value).toBe('Ada');

    await userEvent.fill(name, 'Grace');
    expect(form.controls.name.$value()).toBe('Grace');

    form.controls.tags.at(0)!.controls.tag.setValue('logic');
    await fixture.whenStable();
    expect(host.querySelector<HTMLInputElement>('.tag')!.value).toBe('logic');
  });

  it("show a control's error once it is touched, or at once when asked", async () => {
    const { fixture, host, form, text } = await render();
    await userEvent.fill(host.querySelector('.email')!, 'not-an-email');
    await fixture.whenStable();
    expect(host.querySelector('.email-error')).toBeNull();
    expect(text('any-error')).toBe('false');
    expect(text('any-error-untouched')).toBe('true');

    form.controls.email.metaFn.markAsTouched();
    await fixture.whenStable();
    expect(host.querySelector('.email-error')).not.toBeNull();
    expect(text('any-error')).toBe('true');
  });

  // A group's error value came only from its first child: the first one without it ended the search
  it("give an error's value from whichever child has it", async () => {
    const { fixture, form, json } = await render();
    expect(json('email-value')).toBeNull();

    form.controls.email.setValue('not-an-email');
    await fixture.whenStable();

    expect(json('email-value')).toBe(true);
  });

  it("list an array's rows as they change, and give its controls by path", async () => {
    const { fixture, host, form, component, text, json } = await render();
    expect(text('tag-count')).toBe('1');
    expect(json('first-tag')).toEqual({ tag: 'math' });

    form.controls.tags.push(component.tag('art'));
    await fixture.whenStable();

    expect(Array.from(host.querySelectorAll<HTMLInputElement>('.tag'), input => input.value)).toEqual(['math', 'art']);
    expect(text('tag-count')).toBe('2');
  });

  it("follow a control's, a group's and an array's value as it changes", async () => {
    const { fixture, form, component, text, json } = await render();
    expect(text('name-value')).toBe('Ada');

    form.controls.name.setValue('Grace');
    form.controls.tags.push(component.tag('art'));
    await fixture.whenStable();

    expect(text('name-value')).toBe('Grace');
    expect(json('tags-value')).toEqual([{ tag: 'math' }, { tag: 'art' }]);
    expect(json('value')).toEqual({ name: 'Grace', email: '', tags: [{ tag: 'math' }, { tag: 'art' }] });
    expect(json('raw')).toEqual(json('value'));
  });

  it('throw for a path that leads nowhere or to another kind of control', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const form = fixture.componentInstance.form;

    expect(() => new FormControlPipe().transform(form, 'phone')).toThrow('formControl: No child found at path "phone"');
    expect(() => new FormControlPipe().transform(form, 'tags')).toThrow('formControl: Expected a FormControl at path "tags", but got "array"');
    expect(() => new FormGroupPipe().transform(form, 'name')).toThrow('formGroup: Expected a FormGroup at path "name", but got "control"');
    expect(() => new FormArrayPipe().transform(form, 'name')).toThrow('formArray: Expected a FormArray at path "name", but got "control"');
  });
});
