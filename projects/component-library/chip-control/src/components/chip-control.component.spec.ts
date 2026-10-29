import { ChangeDetectionStrategy, Component, ErrorHandler, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { axeViolations } from '../../../testing/axe';
import type { ChipData } from '../models/chip-data';
import { TableauUiChipControlModule } from '../tableau-ui-chip-control.module';
import { ChipControlComponent } from './chip-control.component';

interface Tag {
  id: string;
}

// The app's lookup, which the test answers one call at a time
class Lookup {
  readonly calls: { keys: Tag[]; resolve: (data: ChipData<Tag, string>[]) => void; reject: (error: Error) => void }[] = [];
  readonly fn = async (keys: Tag[]) =>
    new Promise<ChipData<Tag, string>[]>((resolve, reject) => {
      this.calls.push({ keys, resolve, reject });
    });
  // answers call `index`, once it is made, with each key's name, under key objects of its own, as a server's answer has
  async answer(index = 0) {
    const call = await this.made(index);
    call.resolve(call.keys.map(key => ({ key: { id: key.id }, value: key.id.toUpperCase() })));
  }
  async fail(index: number, error: Error) {
    (await this.made(index)).reject(error);
  }
  // call `index`, once the control has made it
  async made(index: number) {
    await vi.waitFor(() => {
      expect(this.calls.length).toBeGreaterThan(index);
    });
    return this.calls[index];
  }
}

@Component({
  imports: [ReactiveFormsModule, TableauUiChipControlModule, TableauUiChipModule, TableauUiFormFieldModule, TableauUiCommonModule],
  template: `
    <tab-form-field>
      <tab-label>Tags</tab-label>
      <tab-chip-control #chips [formControl]="control" [getValuesByKeys]="lookup.fn" [keyComparer]="sameTag" ($chipAdded)="added.push($event.key.id)" ($chipRemoved)="removed.push($event.id)">
        <ng-template let-ctx [tabChipTemplate]="chips">
          <tab-chip [allowRemove]="ctx.removable" [selected]="ctx.selected" (removed)="ctx.chipControl.remove(ctx.data.key)"
            ><span class="name">{{ ctx.data.value }}</span></tab-chip
          >
        </ng-template>
      </tab-chip-control>
    </tab-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TagsComponent {
  control = new FormControl<Tag[] | null>(null);
  readonly lookup = new Lookup();
  readonly sameTag = (a: Tag, b: Tag) => a.id === b.id;
  readonly added: string[] = [];
  readonly removed: string[] = [];
  readonly $chips = viewChild.required<ChipControlComponent<Tag, string>>('chips');
}

const tags = (...ids: string[]) => ids.map(id => ({ id }));
const ids = (value: Tag[] | null) => value?.map(tag => tag.id) ?? value;

describe('ChipControlComponent', () => {
  async function render(control?: FormControl<Tag[] | null>) {
    const fixture = TestBed.createComponent(TagsComponent);
    const component = fixture.componentInstance;
    if (control) {
      component.control = control;
    }
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const values: unknown[] = [];
    component.control.valueChanges.subscribe(value => values.push(ids(value)));
    const chipTexts = (selector = 'tab-chip') => Array.from(host.querySelectorAll(`${selector} .name`), name => name.textContent.trim());
    // lets a lookup's answer reach the control, then renders
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    // the form writes these keys, and the lookup answers for them
    let answered = 0;
    const show = async (keys: Tag[]) => {
      component.control.setValue(keys);
      await fixture.whenStable();
      await component.lookup.answer(answered++);
      await settle();
    };
    return { fixture, host, component, values, chipTexts, settle, show, input: host.querySelector('input')!, chips: component.$chips() };
  }

  // F32: a null write (a new FormControl, reset) set the keys to null, so the control threw and lost every later chip
  it('takes a null write as no chips, and still sends the chips added after it', async () => {
    const { fixture, component, chipTexts, chips } = await render();

    chips.add({ id: 'a' }, 'A', true);
    await fixture.whenStable();

    expect(ids(component.control.value)).toEqual(['a']);
    expect(chipTexts()).toEqual(['A']);
  });

  // F33: every keys change, a form's own write included, went back to the form as the user's; the first write also lost
  // its keys to the effect that mirrored the chips back into them
  it("keeps the form pristine through its own writes, and sends each of the user's changes once", async () => {
    const { fixture, component, values, chipTexts, chips, settle } = await render(new FormControl<Tag[] | null>(tags('a')));
    await component.lookup.answer();
    await settle();
    expect(chipTexts()).toEqual(['A']);

    component.control.patchValue(tags('a', 'b'));
    await fixture.whenStable();
    await component.lookup.answer(1);
    await settle();

    expect(chipTexts()).toEqual(['A', 'B']);
    expect(component.control.pristine).toBe(true);
    expect(values).toEqual([['a', 'b']]);

    chips.remove({ id: 'a' });
    await fixture.whenStable();

    expect(chipTexts()).toEqual(['B']);
    expect(component.control.dirty).toBe(true);
    expect(values).toEqual([['a', 'b'], ['b']]);
  });

  // F34: removing while iterating skipped the chip after each removed one
  it('removes every chip a write leaves out', async () => {
    const { fixture, component, chipTexts, show } = await render(new FormControl<Tag[] | null>([]));
    await show(tags('a', 'b', 'c'));
    expect(chipTexts()).toEqual(['A', 'B', 'C']);

    component.control.setValue([]);
    await fixture.whenStable();

    expect(chipTexts()).toEqual([]);
    expect(component.removed).toEqual(['a', 'b', 'c']);
  });

  // F35: touched was set on focus, so with updateOn: 'blur' the last change was never committed
  it('is touched on blur, which commits the change made before it', async () => {
    const control = new FormControl<Tag[] | null>([], { updateOn: 'blur' });
    const { fixture, input, chips } = await render(control);

    input.focus();
    await fixture.whenStable();
    expect(control.touched).toBe(false);

    chips.add({ id: 'a' }, 'A', true);
    await fixture.whenStable();
    input.blur();
    await fixture.whenStable();

    expect(control.touched).toBe(true);
    expect(ids(control.value)).toEqual(['a']);
  });

  // F43: a slow lookup wrote back the keys it started from, so a change the form made while it waited was undone
  it('keeps a change the form makes while a lookup is waiting', async () => {
    const { fixture, component, chipTexts, settle } = await render(new FormControl<Tag[] | null>([]));
    component.control.setValue(tags('a'));
    await fixture.whenStable();
    await component.lookup.made(0);

    component.control.setValue(tags('b'));
    await fixture.whenStable();
    await component.lookup.answer(0);
    await settle();

    expect(ids(component.control.value)).toEqual(['b']);
    expect(chipTexts()).toEqual([]);

    await component.lookup.answer(1);
    await settle();

    expect(chipTexts()).toEqual(['B']);
    expect(ids(component.control.value)).toEqual(['b']);
  });

  // F45: one failed lookup left the spinner on and every later lookup waiting behind it
  it('reports a failed lookup, and goes on to the next one', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } }] });
    const { fixture, host, component, chipTexts, settle } = await render(new FormControl<Tag[] | null>([]));
    component.control.setValue(tags('a'));
    await fixture.whenStable();
    await vi.waitFor(() => {
      expect(host.querySelector('tab-loading-gif')).not.toBeNull();
    });

    await component.lookup.fail(0, new Error('lookup failed'));
    await settle();
    expect(host.querySelector('tab-loading-gif')).toBeNull();
    expect(errors).toEqual([new Error('lookup failed')]);

    component.control.setValue(tags('b'));
    await fixture.whenStable();
    await component.lookup.answer(1);
    await settle();

    expect(chipTexts()).toEqual(['B']);
  });

  // F46: the control spliced the array the form gave it, so the app's own copy changed and reset could not restore it
  it("leaves the form's array as it was when a chip is removed", async () => {
    const initial = tags('a', 'b');
    const { fixture, component, chips, show } = await render(new FormControl<Tag[] | null>([]));
    await show(initial);

    chips.remove({ id: 'a' });
    await fixture.whenStable();

    expect(ids(initial)).toEqual(['a', 'b']);
    expect(ids(component.control.value)).toEqual(['b']);
  });

  // F47: the highlight compared keys with ===, so the first Backspace highlighted an object-keyed chip invisibly
  it('shows the chip Backspace highlights, by the key comparer, and removes it on the next one', async () => {
    const { fixture, host, component, input, chipTexts, show } = await render(new FormControl<Tag[] | null>([]));
    await show(tags('a', 'b'));

    input.focus();
    await userEvent.keyboard('{Backspace}');
    await fixture.whenStable();
    expect(chipTexts('tab-chip.selected')).toEqual(['B']);

    await userEvent.keyboard('{Backspace}');
    await fixture.whenStable();
    expect(chipTexts()).toEqual(['A']);
    expect(ids(component.control.value)).toEqual(['a']);
  });

  it('passes axe', async () => {
    const { host, show } = await render(new FormControl<Tag[] | null>([]));
    await show(tags('a', 'b'));

    expect(await axeViolations(host)).toEqual([]);
  });
});

@Component({
  imports: [TableauUiChipControlModule],
  template: `
    <tab-chip-control #chips [getValuesByKeys]="lookup.fn" [keyComparer]="sameTag" [(keys)]="$keys" [(values)]="$values">
      <ng-template let-ctx [tabChipTemplate]="chips">
        <span class="name">{{ ctx.data.value }}</span>
      </ng-template>
    </tab-chip-control>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BoundTagsComponent {
  readonly lookup = new Lookup();
  readonly sameTag = (a: Tag, b: Tag) => a.id === b.id;
  readonly $keys = signal<Tag[]>([]);
  readonly $values = signal<ChipData<Tag, string>[]>([]);
}

describe('ChipControlComponent without a form', () => {
  async function render(before?: (component: BoundTagsComponent) => void) {
    const fixture = TestBed.createComponent(BoundTagsComponent);
    before?.(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const names = () => Array.from(host.querySelectorAll('.name'), name => name.textContent.trim());
    return { fixture, component: fixture.componentInstance, names };
  }

  // The keys are the one state the control changes; values the app binds are chips to show, and set the keys
  it('shows the values the app binds and keeps both bindings in step with the keys', async () => {
    const { fixture, component, names } = await render();

    component.$values.set([{ key: { id: 'a' }, value: 'Alpha' }]);
    await fixture.whenStable();
    expect(names()).toEqual(['Alpha']);
    expect(ids(component.$keys())).toEqual(['a']);
    expect(component.lookup.calls).toEqual([]);

    component.$keys.set(tags('a', 'b'));
    await fixture.whenStable();
    await component.lookup.answer();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(names()).toEqual(['Alpha', 'B']);
    expect(component.$values().map(chip => chip.value)).toEqual(['Alpha', 'B']);
  });

  // Round 1, A1: the effect that writes the chips back to the values ran first, and wrote [] over the app's values
  it('shows the values the app binds on the first render, and values set with keys', async () => {
    const { fixture, component, names } = await render(bound => bound.$values.set([{ key: { id: 'a' }, value: 'Alpha' }]));

    expect(names()).toEqual(['Alpha']);
    expect(ids(component.$keys())).toEqual(['a']);

    component.$keys.set(tags('b'));
    component.$values.set([{ key: { id: 'b' }, value: 'Beta' }]);
    await fixture.whenStable();

    expect(names()).toEqual(['Beta']);
    expect(component.lookup.calls).toEqual([]);
  });

  // Round 1, A2: values set the keys, and dropped the keys still being looked up, so those chips never came
  it('keeps the keys still being looked up when the app sets values', async () => {
    const { fixture, component, names } = await render();
    component.$keys.set(tags('a', 'b'));
    await fixture.whenStable();
    await component.lookup.made(0);

    component.$values.set([...component.$values(), { key: { id: 'c' }, value: 'Charlie' }]);
    await fixture.whenStable();
    await component.lookup.answer(0);
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(names()).toEqual(['A', 'B', 'Charlie']);
    expect(ids(component.$keys())).toEqual(['a', 'b', 'c']);
  });
});

@Component({
  imports: [ReactiveFormsModule, TableauUiChipControlModule],
  template: `
    <tab-chip-control #chips [formControl]="control" [getValuesByKeys]="lookup.fn" [keyComparer]="sameTag" [keys]="$keys()" [values]="$values()">
      <ng-template let-ctx [tabChipTemplate]="chips">
        <span class="name">{{ ctx.data.value }}</span>
      </ng-template>
    </tab-chip-control>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormBoundTagsComponent {
  readonly control = new FormControl<Tag[] | null>([]);
  readonly lookup = new Lookup();
  readonly sameTag = (a: Tag, b: Tag) => a.id === b.id;
  readonly $keys = signal<Tag[]>([]);
  readonly $values = signal<ChipData<Tag, string>[]>([]);
}

describe('ChipControlComponent with a form and bindings', () => {
  // The form hears only the user's changes: keys or values the app binds are not the user's
  it('leaves the form pristine when the app sets keys or values', async () => {
    const fixture = TestBed.createComponent(FormBoundTagsComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const values: unknown[] = [];
    component.control.valueChanges.subscribe(value => values.push(value));

    component.$values.set([{ key: { id: 'a' }, value: 'Alpha' }]);
    await fixture.whenStable();
    component.$keys.set(tags('a', 'b'));
    await fixture.whenStable();
    await component.lookup.answer();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.name'), name => name.textContent.trim())).toEqual(['Alpha', 'B']);
    expect(component.control.pristine).toBe(true);
    expect(values).toEqual([]);
  });
});
