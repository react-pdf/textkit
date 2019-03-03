import slice from '../../src/attributedString/slice';

const testString = 'Lorem ipsum';
const testRuns = [
  { start: 0, end: 6, attributes: { attr: 1 } },
  { start: 6, end: 11, attributes: { attr: 2 } }
];

describe('attributeString slice operator', () => {
  test('should slice with one run', () => {
    const runs = [{ start: 0, end: 11, attributes: { attr: 1 } }];
    const string = { string: testString, runs };
    const sliced = slice(2, 8)(string);

    expect(sliced.string).toBe('rem ip');
    expect(sliced.runs[0]).toHaveProperty('start', 0);
    expect(sliced.runs[0]).toHaveProperty('end', 6);
    expect(sliced.runs[0]).toHaveProperty('attributes', { attr: 1 });
  });

  test('should slice with two runs', () => {
    const string = { string: testString, runs: testRuns };
    const splittedString = slice(2, 8)(string);

    expect(splittedString.string).toBe('rem ip');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 4);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
    expect(splittedString.runs[1]).toHaveProperty('start', 4);
    expect(splittedString.runs[1]).toHaveProperty('end', 6);
    expect(splittedString.runs[1]).toHaveProperty('attributes', { attr: 2 });
  });

  test('should slice with several runs', () => {
    const runs = [
      { start: 0, end: 3, attributes: { attr: 1 } },
      { start: 3, end: 6, attributes: { attr: 2 } },
      { start: 6, end: 11, attributes: { attr: 3 } }
    ];
    const string = { string: testString, runs };
    const splittedString = slice(2, 8)(string);

    expect(splittedString.string).toBe('rem ip');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 1);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
    expect(splittedString.runs[1]).toHaveProperty('start', 1);
    expect(splittedString.runs[1]).toHaveProperty('end', 4);
    expect(splittedString.runs[1]).toHaveProperty('attributes', { attr: 2 });
    expect(splittedString.runs[2]).toHaveProperty('start', 4);
    expect(splittedString.runs[2]).toHaveProperty('end', 6);
    expect(splittedString.runs[2]).toHaveProperty('attributes', { attr: 3 });
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const string = { string: testString, runs: testRuns };
    const splittedString = slice(6, 11)(string);

    expect(splittedString.runs.length).toBe(1);
    expect(splittedString.string).toBe('ipsum');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 5);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 2 });
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const string = { string: testString, runs: testRuns };
    const splittedString = slice(1, 6)(string);

    expect(splittedString.runs.length).toBe(1);
    expect(splittedString.string).toBe('orem ');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 5);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
  });
});
