/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AC } from '../interfaces';
import type { Hierarchy, HierarchyData } from './interfaces';
import type { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import type { WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import type { FA } from '../../form-array/interaces';
import type { FG } from '../../form-group/interfaces';
import type { FC } from '../../form-control/interfaces';

export class HierarchyImpl implements Hierarchy {
  constructor(
    private readonly ctrl: AC,
    initialChildren: AC[],
    subscriptions: Subscription[] = [],
  ) {
    this.childList$ = new BehaviorSubject<AC[]>(initialChildren);
    subscriptions.push(
      this.childList$.subscribe(c => {
        this.$childList.set(c);
      }),
    );
  }

  /**
   *  The parent of this control
   */
  parent: AC | undefined;
  /**
   * The root of this control. This is the top level control in the tree.
   */
  get root(): AC | undefined {
    let { parent } = this;
    while (parent) {
      if (parent.hierarchy.parent) {
        parent = parent.hierarchy.parent;
      } else {
        return parent;
      }
    }
    return undefined;
  }
  readonly childList$: BehaviorSubject<AC[]>;
  readonly $childList: WritableSignal<AC[]> = signal<AC[]>([]);

  public getChild(path?: string[] | string): AC | undefined {
    if (path === undefined) {
      return HierarchyImpl._getChild$(this.ctrl, []);
    }
    if (typeof path === 'string') {
      path = path.split('.').filter(p => p !== '');
    }
    return HierarchyImpl._getChild$(this.ctrl, path);
  }
  private static _getChild$(form: AC, parts: string[]): AC | undefined {
    const key = parts.shift();
    if (key === undefined) {
      return form;
    }

    if (form.type === 'array') {
      const index = parseInt(key, 10);
      if (isNaN(parseInt(key, 10))) {
        return undefined;
      }
      return this._getChild$((form as FA<any>).$controls()[index], parts);
    }
    if (form.type === 'group') {
      const control = (form as FG<any>).controls[key];
      if (control === undefined) {
        return undefined;
      }
      return this._getChild$(control, parts);
    }
    return undefined;
  }
  get hierarchyData() {
    return HierarchyImpl._getHierarchyData(this.ctrl);
  }

  private static _getHierarchyData(control: AC, name = ''): HierarchyData {
    const ret = {
      name: name,
      status: control.$meta().validity,
      value: undefined,
      meta: control.$meta(),
    } as HierarchyData;
    if (control.type === 'control') {
      const c = control as FC<any>;
      ret.value = c.$value();
    }
    if (control.type === 'group') {
      const group = control as FG<any>;
      ret.value = group.$value();
      ret.children = Object.keys(group.controls).reduce<Record<string, HierarchyData>>((acc, key) => {
        const child = group.controls[key];
        if (child !== undefined) {
          acc[key] = this._getHierarchyData(child, key);
        }
        return acc;
      }, {});
    }
    if (control.type === 'array') {
      const arr = control as FA<any>;
      ret.children = arr.$controls().reduce<Record<string, HierarchyData>>((acc, child, index) => {
        if (child !== undefined) {
          acc[index] = this._getHierarchyData(child, index.toString());
        }
        return acc;
      }, {});
    }

    return ret;
  }
}
