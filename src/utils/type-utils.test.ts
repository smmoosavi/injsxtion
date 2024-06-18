import { expect, it } from 'vitest';
import {
  Equal,
  Expect,
  IsOptional,
  OptionalFields,
  RequiredFields,
} from './type-utils';

it('is ok', function () {
  expect(1).toBe(1);
});

type ABCD = {
  a: number;
  b: number;
  c?: number;
  d?: number;
};

export type OptionalCases =
  | Expect<Equal<IsOptional<ABCD, 'a'>, false>>
  | Expect<Equal<IsOptional<ABCD, 'c'>, true>>
  | Expect<Equal<RequiredFields<ABCD>, 'a' | 'b'>>
  | Expect<Equal<OptionalFields<ABCD>, 'c' | 'd'>>;
