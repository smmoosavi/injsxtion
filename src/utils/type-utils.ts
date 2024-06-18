/* -- expect utils -- */
export type Expect<T extends true> = T;
export type ExpectTrue<T extends true> = T;
export type ExpectFalse<T extends false> = T;
export type IsTrue<T extends true> = T;
export type IsFalse<T extends false> = T;

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsNever<T> = [T] extends [never] ? true : false;

/* -- optional utils -- */

export type IsOptional<T, K extends keyof T> =
  Partial<Pick<T, K>> extends Pick<T, K> ? true : false;

export type OptionalFields<T> = {
  [K in keyof T]-?: IsOptional<T, K> extends true ? K : never;
}[keyof T];
export type RequiredFields<T> = {
  [K in keyof T]-?: IsOptional<T, K> extends true ? never : K;
}[keyof T];
