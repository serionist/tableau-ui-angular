import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Primitive } from '../../common/types/primitive';
import { FB } from './fb';
import { combineLatest } from 'rxjs';
import type { FormReferencesOf } from '../types/form-references-of';


interface test {
    a: string;
    b?: number;
    c: 'a' | 'b' | 'c';
    d: boolean[];
    e?: boolean[];
    f: test2;
    g?: test2;
    h: test2[];
    i?: test2[];
    j: test3;
}
interface test2 {
    a: string;
    b?: number;
    c: boolean;
    d: boolean[];
    e?: boolean[];
}
class test3 {}

//const a: FormReferencesOf<test>;

// const b: ControlsOf<test>;

const b = new FB();
const a = b.control<boolean>( true, undefined, undefined );


const a2 = b.control<string>('asd');
export interface ITest {
    name?: string;
    age: number | undefined;
    aaa: Date;
    address: IAddress;
}
export interface IAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    test: ITest2;
}
export interface ITest2 {
    name: string;
    age: number;
}

const c4: NonNullable<string | undefined> = 'a';
const gRefs: FormReferencesOf<ITest> = {
    name: b.control<string | undefined>('test'),
    age: b.control<number | undefined>(0),
    aaa: b.control<Date>(new Date()),
    address: b.group<IAddress>({
        street: b.control<string>('test'),
        city: b.control<string>('test'),
        state: b.control<string>('test'),
        zip: b.control<string>('test'),
        test: b.group<ITest2>({
            name: b.control<string>('test'),
            age: b.control<number>(0),
        }),
    }),
    
    
};
const g = b.group<ITest>(gRefs
);
const gbuilder = b.group<ITest>({
    name: b.control<string | undefined>('test'),
    age: b.control<number | undefined>(0),
    aaa: b.control<Date>(new Date()),
    address: b.group<IAddress>({
        street: b.control<string>('test'),
        city: b.control<string>('test'),
        state: b.control<string>('test'),
        zip: b.control<string>('test'),
        test: b.group({
            name: b.control<string>('test'),
            age: b.control<number>(0),
        }),
    }),
});
const c = gbuilder.controls.age;
const n = gbuilder.controls.name;
gbuilder.controls.age.setValue(10);

const arr = b.array<ITest>([g]);
combineLatest([a.value$, arr.value$]).subscribe((e) => e[0]);
