import advanceWidthBetween from '../../src/run/advanceWidthBetween';

describe('run advanceWidthBetween operator', () => {
  test('should return 0 if positions not present', () => {
    const run = { start: 5, end: 15, attributes: {} };

    expect(advanceWidthBetween(8, 10, run)).toBe(0);
  });

  test('should return 0 if positions empty', () => {
    const run = { start: 5, end: 15, attributes: {}, positions: [] };

    expect(advanceWidthBetween(run)).toBe(0);
  });

  test('should sum up positions values', () => {
    const positions = [
      { xAdvance: 5 },
      { xAdvance: 10 },
      { xAdvance: 15 },
      { xAdvance: 17 },
      { xAdvance: 18 }
    ];
    const run = { start: 0, end: 5, attributes: {}, positions };

    expect(advanceWidthBetween(1, 4, run)).toBe(42);
  });

  test('should sum up positions values when not starting on zero', () => {
    const positions = [
      { xAdvance: 5 },
      { xAdvance: 10 },
      { xAdvance: 15 },
      { xAdvance: 17 },
      { xAdvance: 18 }
    ];
    const run = { start: 5, end: 10, attributes: {}, positions };

    expect(advanceWidthBetween(7, 9, run)).toBe(32);
  });
});
