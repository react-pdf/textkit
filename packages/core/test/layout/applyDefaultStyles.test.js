import applyDefaultStyles from '../../src/layout/applyDefaultStyles';

const instance = applyDefaultStyles();

describe('applyDefaultStyles', () => {
  test('should return empty AttributedString if nothing passed', () => {
    const result = instance();

    expect(result.constructor.name).toEqual('AttributedString');
    expect(result.string).toEqual('');
    expect(result.runs).toHaveLength(0);
  });

  test('should return not change passed string', () => {
    const result = instance({ string: 'Lorem' });

    expect(result.constructor.name).toEqual('AttributedString');
    expect(result.string).toEqual('Lorem');
    expect(result.runs).toHaveLength(0);
  });

  test('should apply default styles to passed run', () => {
    const result = instance({ string: 'Lorem', runs: [{ start: 0, end: 5, attributes: {} }] });

    expect(result.constructor.name).toEqual('AttributedString');
    expect(result.string).toEqual('Lorem');
    expect(result.runs[0].start).toEqual(0);
    expect(result.runs[0].end).toEqual(5);
    expect(result.runs[0].attributes.fontSize).toBe(12);
    expect(result.runs[0].attributes.attachment).toBe(null);
  });
});
