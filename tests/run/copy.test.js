import copy from '../../src/run/copy';

describe('run copy operator', () => {
  test('should create copy of run', () => {
    const attributes = { something: 'blah' };
    const run = { start: 5, end: 15, attributes };
    const copied = copy(run);

    expect(copied).not.toBe(run);
    expect(copied).toHaveProperty('start', 5);
    expect(copied).toHaveProperty('end', 15);
    expect(copied).toHaveProperty('attributes', attributes);
  });
});
