import fragmentGenerator from '../../src/core/fragmentGenerator';

describe('fragmentGenerator', () => {
  test('should return empty array if no rect passed', () => {
    expect(fragmentGenerator(null, 10)).toEqual([]);
  });

  test('should return empty array if line height higher than rect', () => {
    const rect = { x: 10, y: 10, width: 100, height: 5 };
    expect(fragmentGenerator(rect, 10)).toEqual([]);
  });

  test('should return single fragment if not enough space for more', () => {
    const rect = { x: 10, y: 10, width: 100, height: 18 };
    const result = fragmentGenerator(rect, 10);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('x', 10);
    expect(result[0]).toHaveProperty('y', 10);
    expect(result[0]).toHaveProperty('width', 100);
    expect(result[0]).toHaveProperty('height', 10);
  });

  test('should return many fragments', () => {
    const rect = { x: 10, y: 10, width: 100, height: 35 };
    const result = fragmentGenerator(rect, 10);

    expect(result).toHaveLength(3);

    expect(result[0]).toHaveProperty('x', 10);
    expect(result[0]).toHaveProperty('y', 10);
    expect(result[0]).toHaveProperty('width', 100);
    expect(result[0]).toHaveProperty('height', 10);

    expect(result[1]).toHaveProperty('x', 10);
    expect(result[1]).toHaveProperty('y', 20);
    expect(result[1]).toHaveProperty('width', 100);
    expect(result[1]).toHaveProperty('height', 10);

    expect(result[2]).toHaveProperty('x', 10);
    expect(result[2]).toHaveProperty('y', 30);
    expect(result[2]).toHaveProperty('width', 100);
    expect(result[2]).toHaveProperty('height', 10);
  });
});
