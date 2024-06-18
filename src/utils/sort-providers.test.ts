import { describe, expect, it } from 'vitest';
import { Edge, sortProviders } from './sort-providers';

describe('sort dag', function () {
  it('should returns empty array for empty input', function () {
    const input: Edge[] = [];
    const result = sortProviders(input, {});
    expect(result).toEqual([]);
  });
  it('should sort one edge correctly', function () {
    const input: Edge[] = [['a', 'b']];
    const result = sortProviders(input, {});
    expect(result).toEqual(['b']);
  });
  it('should sort serial edges correctly', function () {
    const input: Edge[] = [
      ['a', 'b'],
      ['b', 'c'],
    ];
    const result = sortProviders(input, {});
    expect(result).toEqual(['c', 'b']);
  });
  it('should sort parallel edges correctly', function () {
    const input: Edge[] = [
      ['a', 'b'],
      ['b', 'd'],
      ['a', 'c'],
      ['c', 'd'],
    ];
    const result = sortProviders(input, {});
    expect(result).toEqual(['d', 'b', 'c']);
  });
  it('should care priority in parallel edges', function () {
    const input: Edge[] = [
      ['a', 'b'],
      ['b', 'd'],
      ['a', 'c'],
      ['c', 'd'],
    ];
    const result = sortProviders(input, { b: 10 });
    expect(result).toEqual(['d', 'c', 'b']);
  });

  /*
    complex case
                      ┌───┐     ┌───┐
    ┌──────────────── │ y │ ◀── │ x │ ◀─────┐
    │                 └───┘     └───┘       │
    │                             ▲         │
    ▼                             │         │
  ┌───┐     ┌───┐     ┌───┐     ┌───┐     ┌───┐
  │ d │ ◀── │ c │ ◀── │ b │ ◀── │ a │ ◀── │ r │
  └───┘     └───┘     └───┘     └───┘     └───┘
  */

  it('should handle complex cases', function () {
    const input: Edge[] = [
      ['r', 'a'],
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['r', 'x'],
      ['x', 'y'],
      ['y', 'd'],
      ['a', 'x'],
    ];
    const result = sortProviders(input, {});
    expect(result).toEqual(['d', 'c', 'b', 'y', 'x', 'a']);
  });
  it('should handle complex cases with priority', function () {
    const input: Edge[] = [
      ['r', 'a'],
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['r', 'x'],
      ['x', 'y'],
      ['y', 'd'],
      ['a', 'x'],
    ];
    const result = sortProviders(input, { y: -10 });
    expect(result).toEqual(['d', 'y', 'c', 'b', 'x', 'a']);
  });

  it('should handle complex cases with priority 2', function () {
    const input: Edge[] = [
      ['r', 'a'],
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['r', 'x'],
      ['x', 'y'],
      ['y', 'd'],
      ['a', 'x'],
    ];
    const result = sortProviders(input, { y: -10, b: 10 });
    expect(result).toEqual(['d', 'y', 'c', 'x', 'b', 'a']);
  });
  it('should handle complex cases with priority 3', function () {
    const input: Edge[] = [
      ['r', 'a'],
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['r', 'x'],
      ['x', 'y'],
      ['y', 'd'],
      ['a', 'x'],
    ];
    const result = sortProviders(input, { y: -10, b: 10, c: -20, a: -40 });
    expect(result).toEqual(['d', 'c', 'y', 'x', 'b', 'a']);
  });
  it('should handle realistic example', function () {
    const input: Edge[] = [
      ['p1', 'com'],
      ['p2', 'com'],
      ['p3', 'com'],
      ['p3', 'd3'],
      ['com', 'theme'],
      ['com', 'i18n'],
      ['com', 'client'],
      ['com', 'snack'],
      ['snack', 'theme'],
      ['com', 'auth'],
      ['auth', 'client'],
    ];
    const result = sortProviders(input, { client: -30, com: 30 });
    expect(result).toEqual([
      'client',
      'theme',
      'i18n',
      'snack',
      'auth',
      'd3',
      'com',
    ]);
  });
});
