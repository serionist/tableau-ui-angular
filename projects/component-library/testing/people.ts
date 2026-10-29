// What the specs share; never published, since no entry point imports it.
import type { DataSort, FullDataRequest, IncrementalDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions, IncrementalDataOptions } from 'tableau-ui-angular/virtualize';

export interface Person {
  id: number;
  name: string;
}

/** Person 1 to Person 100, by id */
export const PEOPLE: readonly Person[] = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Person ${i + 1}` }));

/** A request the server holds until the test answers it */
export interface HeldRequest {
  readonly offset?: number;
  readonly count?: number;
  readonly sort: readonly DataSort[];
  readonly abort: AbortSignal;
  /** Answered, failed, or failed on its abort */
  done: boolean;
  answer: () => void;
  /** Fails it, as a server error does */
  fail: () => void;
}

/**
 * A server for the virtual scroller's and the table's data options that holds each request until the test answers it,
 * so a test decides the order loads finish in. An aborted request fails at once, as `fetch` does, unless
 * `ignoresAbort` is set, as on a server that answers anyway. Each answer is built from `rows` as they are then.
 */
export class PeopleServer {
  readonly requests: HeldRequest[] = [];
  ignoresAbort = false;
  rows: readonly Person[];

  constructor(rows: readonly Person[] = PEOPLE) {
    this.rows = rows;
  }

  readonly incremental = new IncrementalDataOptions<Person>(
    person => person.id,
    async (req: IncrementalDataRequest) => this.hold(req, rows => ({ total: rows.length, data: rows.slice(req.offset, req.offset + req.count) })),
  );

  readonly full = new FullDataOptions<Person>(
    person => person.id,
    async (req: FullDataRequest) => this.hold(req, rows => ({ data: [...rows] })),
  );

  get waiting(): HeldRequest[] {
    return this.requests.filter(request => !request.done);
  }

  /** Answers every waiting request, then the ones their answers lead to, until none waits; `settle` lets the page render */
  async answerAll(settle: () => Promise<void>): Promise<void> {
    await settle();
    for (let round = 0; round < 20 && this.waiting.length > 0; round++) {
      for (const request of this.waiting) {
        request.answer();
      }
      await settle();
    }
  }

  private async hold<T>(req: FullDataRequest & Partial<IncrementalDataRequest>, build: (rows: readonly Person[]) => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const held: HeldRequest = {
        offset: req.offset,
        count: req.count,
        sort: req.sort,
        abort: req.abort,
        done: false,
        answer: () => {
          held.done = true;
          resolve(build(sortRows(this.rows, req.sort)));
        },
        fail: () => {
          held.done = true;
          reject(new Error('The server failed'));
        },
      };
      req.abort.addEventListener('abort', () => {
        if (!this.ignoresAbort && !held.done) {
          held.done = true;
          reject(new DOMException('The request was aborted', 'AbortError'));
        }
      });
      this.requests.push(held);
    });
  }
}

function sortRows(rows: readonly Person[], sort: readonly DataSort[]): Person[] {
  return [...rows].sort((a, b) => {
    for (const { property, direction } of sort) {
      const left = a[property as keyof Person];
      const right = b[property as keyof Person];
      if (left !== right) {
        return (left < right ? -1 : 1) * (direction === 'asc' ? 1 : -1);
      }
    }
    return 0;
  });
}
