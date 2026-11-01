import { Subscription } from 'rxjs';
import { InTurn, InTurnSubject, sameValue } from './in-turn';

describe('InTurnSubject', () => {
  it('gives a subscriber added during a held emit the value being emitted, and then the held one', () => {
    const subject = new InTurnSubject<number>(0);
    const added: number[] = [];
    subject.subscribe(value => {
      if (value === 1) {
        subject.next(2);
        subject.subscribe(v => added.push(v));
      }
    });

    subject.next(1);

    expect(added).toEqual([1, 2]);
  });

  it('gives nothing more to a subscriber removed during a held emit', () => {
    const subject = new InTurnSubject<number>(0);
    const removed = new Subscription();
    const seen: number[] = [];
    subject.subscribe(value => {
      if (value === 1) {
        subject.next(2);
        removed.unsubscribe();
      }
    });
    removed.add(subject.subscribe(v => seen.push(v)));

    subject.next(1);

    expect(seen).toEqual([0]);
    expect(subject.value).toBe(2);
  });

  it('reads the held value as latest during an emit, and its value outside one', () => {
    const subject = new InTurnSubject<number>(0);
    const read: number[][] = [];
    subject.subscribe(value => {
      if (value === 1) {
        subject.next(2);
        read.push([subject.value, subject.latest]);
      }
    });
    expect(subject.latest).toBe(0);

    subject.next(1);

    expect(read).toEqual([[1, 2]]);
    expect([subject.value, subject.latest]).toEqual([2, 2]);
  });

  it('drops a held value the same as the one just emitted', () => {
    const subject = new InTurnSubject<{ a: number[] }>({ a: [0] });
    const seen: { a: number[] }[] = [];
    subject.subscribe(value => {
      if (value.a[0] === 1) {
        subject.next({ a: [1] });
      }
    });
    subject.subscribe(value => seen.push(value));

    subject.next({ a: [1] });

    expect(seen).toEqual([{ a: [0] }, { a: [1] }]);
  });

  it('throws after 100 held runs in one turn, drops the held value and goes on working', () => {
    const subject = new InTurnSubject<number>(0);
    let counting = false;
    const seen: number[] = [];
    subject.subscribe(value => {
      if (counting) {
        subject.next(value + 1);
      }
    });
    subject.subscribe(value => seen.push(value));

    counting = true;
    expect(() => subject.next(1)).toThrowError(/value\$ didn't settle within 100 rounds in one turn/);
    counting = false;

    // 0 when it subscribed, 1, then the 100 held runs; 102 was dropped
    expect(seen).toEqual(Array.from({ length: 102 }, (_, i) => i));
    subject.next(5);
    expect(seen.at(-1)).toBe(5);
    expect(subject.latest).toBe(5);
  });
});

describe('InTurn', () => {
  it('merges the values held during one emit', () => {
    const turn = new InTurn<string>('test', (held, value) => held + value);
    const emitted: string[] = [];

    turn.run('a', value => {
      emitted.push(value);
      if (value === 'a') {
        turn.run('b', () => undefined);
        turn.run('c', () => undefined);
      }
    });

    expect(emitted).toEqual(['a', 'bc']);
  });
});

describe('sameValue', () => {
  it.each([
    ['dates at the same time', new Date(0), new Date(0), true],
    ['dates at different times', new Date(0), new Date(1), false],
    ['nested objects and arrays', { a: { b: [1, 'x', null, new Date(0)] } }, { a: { b: [1, 'x', null, new Date(0)] } }, true],
    ['an object with a key more', { a: 1 }, { a: 1, b: undefined }, false],
    ['arrays of different lengths', [1], [1, 1], false],
    ['a sparse array and a full one', new Array<string>(4), ['1', '2', '3', '4'], false],
    ['NaN', Number.NaN, Number.NaN, true],
    ['0 and -0', 0, -0, true],
    ['an array and an object', [], {}, false],
    ['two maps', new Map(), new Map(), false],
  ])('%s', (_name, a, b, same) => {
    expect(sameValue(a, b)).toBe(same);
  });
});
