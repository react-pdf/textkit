import resolveGlyphIndices from '../../src/utils/resolveGlyphIndices';

describe('utils resolveGlyphIndices operator', () => {
  test('should return empty array from empty array', () => {
    const result = resolveGlyphIndices('', []);
    expect(result).toEqual([]);
  });

  test('should return same indices from simple chars', () => {
    const result = resolveGlyphIndices('lorem', [0, 1, 2, 3, 4]);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  test('should return correct glyph indices when starting with ligature', () => {
    const result = resolveGlyphIndices('firem', [0, 2, 3, 4]);
    expect(result).toEqual([0, 0, 1, 2, 3]);
  });

  test('should return correct glyph indices when contain ligature', () => {
    const result = resolveGlyphIndices('lofim', [0, 1, 2, 4]);
    expect(result).toEqual([0, 1, 2, 2, 3]);
  });

  test('should return correct glyph indices when ending in ligature', () => {
    const result = resolveGlyphIndices('lorfi', [0, 1, 2, 3]);
    expect(result).toEqual([0, 1, 2, 3, 3]);
  });

  test('should return correct glyph indices when starting with long ligature', () => {
    const result = resolveGlyphIndices('ffirem', [0, 3, 4, 5]);
    expect(result).toEqual([0, 0, 0, 1, 2, 3]);
  });

  test('should return correct glyph indices when contain long ligature', () => {
    const result = resolveGlyphIndices('loffim', [0, 1, 2, 5]);
    expect(result).toEqual([0, 1, 2, 2, 2, 3]);
  });

  test('should return correct glyph indices when ending in long ligature', () => {
    const result = resolveGlyphIndices('lorffi', [0, 1, 2, 3]);
    expect(result).toEqual([0, 1, 2, 3, 3, 3]);
  });
});
