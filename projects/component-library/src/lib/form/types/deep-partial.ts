export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Date
      ? T[P] // If it's a date, keep it as is
      : T[P] extends object
      ? T[P] extends Function
        ? T[P]
        : DeepPartial<T[P]>
      : T[P];
  };