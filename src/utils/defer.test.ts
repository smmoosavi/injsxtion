import { describe, expect, it } from 'vitest';
import { defer } from './defer';

describe('defer', function () {
  it('should be in pending state when created', function () {
    const d = defer();
    expect(d.state).toBe('pending');
  });
  it('should be in resolve state when resolved', async function () {
    const d = defer();
    d.resolve('foo');
    expect(d.state).toBe('resolved');
    await expect(d.promise).resolves.toBe('foo');
  });
  it('should be in rejected state when rejected', async function () {
    const d = defer();
    d.reject('foo');
    expect(d.state).toBe('rejected');
    await expect(d.promise).rejects.toBe('foo');
  });
});
