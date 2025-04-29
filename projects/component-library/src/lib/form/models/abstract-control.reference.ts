import { AbstractControl } from "@angular/forms";
import { generateRandomString } from "../../utils";
import { Subject, Subscription } from "rxjs";

export interface IAbstractControlWithRef {
    ref: AbstractControlReference;
  }
  
  export abstract class AbstractControlReference {
    readonly id: string = generateRandomString();
    abstract readonly control: AbstractControl & IAbstractControlWithRef;
    protected subscriptions: Subscription[] = [];
    protected childList: AbstractControlReference[] = [];
    protected afterParentEnableChange = new Subject<boolean>();
    protected afterEnableChange = new Subject<boolean>();
  
    protected modifyControlMethods() {
      const originalEnable = this.control.enable.bind(this.control);
      const originalDisable = this.control.disable.bind(this.control);
  
      this.control.enable = (opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }) => {
        originalEnable(opts);
        this.afterEnableChange.next(true);
        for (const child of this.childList) {
          child.afterParentEnableChange.next(true);
        }
      };
  
      this.control.disable = (opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }) => {
        originalDisable(opts);
        this.afterEnableChange.next(false);
        for (const child of this.childList) {
          child.afterParentEnableChange.next(false);
        }
      };
    }
    destroy(): void {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.length = 0;
      this.childList.forEach((child) => child.destroy());
    }
  }
  export abstract class AbstractControlTypedReference<
    TChild extends AbstractControlReference
  > extends AbstractControlReference {
    registerParentEnableChange(callback: (enabled: boolean) => void): TChild {
      this.subscriptions.push(
        this.afterParentEnableChange.subscribe((e) => callback(e))
      );
      return this as unknown as TChild;
    }
    registerEnableChange(callback: (enabled: boolean) => void): TChild {
      this.subscriptions.push(
        this.afterEnableChange.subscribe((e) => callback(e))
      );
      return this as unknown as TChild;
    }
    forceAlwaysDisabled(): TChild {
      this.control.disable();
      this.registerParentEnableChange(() => this.control.disable());
      this.registerEnableChange(() => this.control.disable());
      return this as unknown as TChild;
    }
    // override forceAlwaysEnabled(): TChild {
    //   this.control.enable();
    //   this.registerParentEnableChange(true, () => this.control.enable());
    //   this.registerEnableChange(true, () => this.control.enable());
    //   return this as unknown as TChild;
    // }
  }