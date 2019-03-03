import slice from '../../src/run/slice';

describe('run slice operator', () => {
  test('should slice containing range', () => {
    const attributes = { something: 'blah' };
    const run = { start: 5, end: 15, attributes };
    const sliced = slice(2, 5)(run);

    expect(sliced).toHaveProperty('start', 7);
    expect(sliced).toHaveProperty('end', 10);
    expect(sliced).toHaveProperty('attributes', attributes);
  });

  test('should slice exact range', () => {
    const attributes = { something: 'blah' };
    const run = { start: 5, end: 15, attributes };
    const sliced = slice(0, 10)(run);

    expect(sliced).toEqual(run);
  });

  test('should slice exceeding range', () => {
    const attributes = { something: 'blah' };
    const run = { start: 5, end: 15, attributes };
    const sliced = slice(8, 13)(run);

    expect(sliced).toHaveProperty('start', 13);
    expect(sliced).toHaveProperty('end', 15);
    expect(sliced).toHaveProperty('attributes', attributes);
  });
});
