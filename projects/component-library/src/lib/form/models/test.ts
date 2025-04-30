import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Primitive } from '../types/primitive';
import { FC } from './form-control.reference';
import { FG } from './form-group.reference';
import { FA } from './form-array.reference';
import { ControlReferenceBuilder } from './control-reference-builder';
import { AC } from './abstract-control.reference';
import { combineLatest } from 'rxjs';

const a = new FC<boolean>({
    defaultValue: true,
});



const b = new ControlReferenceBuilder();
const a2 = b.control('asd'); 
export interface ITest {
    name: string;
    age: number;
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
const g = new FG<ITest>({
    controls: {
        name: new FC<string>({
            defaultValue: 'test',
        }),
        age: new FC<number>({
            defaultValue: 0,
        }),
        address: new FG<IAddress>({
            controls: {
                street: new FC<string>({
                    defaultValue: 'test',
                }),
                city: new FC<string>({
                    defaultValue: 'test',
                }),
                state: new FC<string>({
                    defaultValue: 'test',
                }),
                zip: new FC<string>({
                    defaultValue: 'test',
                }),
                test: new FG<ITest2>({
                    controls: {
                        name: new FC<string>({
                            defaultValue: 'test',
                        }),
                        age: new FC<number>({
                            defaultValue: 0,
                        }),
                    },
                }),
            },
        }),
    },
});

const gbuilder = b.group<ITest>({
    name: b.control<string>('test'),
    age: b.control<number>(0),
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

})

const arr = new FA<ITest>({
    controls: [g]
});

combineLatest([
    a.value$,
    arr.value$
]).subscribe(e => e[0])