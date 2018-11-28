import splitParagraphs from '../../src/layout/splitParagraphs';
import AttributedString from '../../src/models/AttributedString';

const instance = splitParagraphs();

describe('splitParagraphs', () => {
  test('should split single paragraph', () => {
    const string = AttributedString.fromFragments([{ string: 'Lorem' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].string).toEqual('Lorem');
  });

  test('should layout break line in between fragment', () => {
    const string = AttributedString.fromFragments([{ string: 'Lorem\nipsum' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].string).toEqual('Lorem\n');
    expect(paragraphs[1].string).toEqual('ipsum');
  });

  test('should split paragraph starting with break line', () => {
    const string = AttributedString.fromFragments([{ string: '\nipsum' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].string).toEqual('\n');
    expect(paragraphs[1].string).toEqual('ipsum');
  });

  test('should layout paragraph starting with \n on different runs', () => {
    const string = AttributedString.fromFragments([{ string: '\n' }, { string: 'Lorem' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].string).toEqual('\n');
    expect(paragraphs[1].string).toEqual('Lorem');
  });

  test('should layout two consecutive break lines at the beggining of fragment', () => {
    const string = AttributedString.fromFragments([{ string: '\n\nLorem' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0].string).toEqual('\n');
    expect(paragraphs[1].string).toEqual('\n');
    expect(paragraphs[2].string).toEqual('Lorem');
  });

  test('should layout two consecutive break lines in between fragment', () => {
    const string = AttributedString.fromFragments([{ string: 'Lorem\n\nipsum' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0].string).toEqual('Lorem\n');
    expect(paragraphs[1].string).toEqual('\n');
    expect(paragraphs[2].string).toEqual('ipsum');
  });

  test('should ignore break line at the end of fragment', () => {
    const string = AttributedString.fromFragments([{ string: 'Lorem\n' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].string).toEqual('Lorem\n');
  });

  test('should layout two consecutive break lines at the end of fragment', () => {
    const string = AttributedString.fromFragments([{ string: 'Lorem\n\n' }]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].string).toEqual('Lorem\n');
    expect(paragraphs[1].string).toEqual('\n');
  });

  test('should layout two consecutive break lines in different runs', () => {
    const string = AttributedString.fromFragments([
      { string: 'Lorem' },
      { string: '\n' },
      { string: '\nipsum' }
    ]);
    const paragraphs = instance(string);

    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0].string).toEqual('Lorem\n');
    expect(paragraphs[1].string).toEqual('\n');
    expect(paragraphs[2].string).toEqual('ipsum');
  });
});
