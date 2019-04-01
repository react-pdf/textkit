import wrapWords from '../../src/core/wrapWords';

const emptyInstance = wrapWords();
const wordHyphenationEngine = jest.fn(x => [x]);
const defaultInstance = wrapWords({ wordHyphenation: wordHyphenationEngine });
const mutateWordHyphenationEngine = jest.fn(x => (x === ' ' ? [x] : [`${x}o`]));
const mutateInstance = wrapWords({ wordHyphenation: mutateWordHyphenationEngine });

describe('wrapWords', () => {
  describe('when engine provided', () => {
    beforeEach(() => {
      wordHyphenationEngine.mockClear();
      mutateWordHyphenationEngine.mockClear();
    });

    test('should return no attributed strings if none provided', () => {
      const result = defaultInstance([]);
      expect(result).toEqual([]);
      expect(wordHyphenationEngine.mock.calls).toHaveLength(0);
    });

    test('should return no syllables when empty string provided', () => {
      const result = defaultInstance([{ string: '', runs: [] }]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual([]);
      expect(result[0].string).toEqual('');
      expect(wordHyphenationEngine.mock.calls).toHaveLength(0);
    });

    test('should return syllables when single run string', () => {
      const result = defaultInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 11
            }
          ]
        }
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(1);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 11);

      expect(wordHyphenationEngine.mock.calls).toHaveLength(3);
      expect(wordHyphenationEngine.mock.calls[0][0]).toEqual('Lorem');
      expect(wordHyphenationEngine.mock.calls[1][0]).toEqual(' ');
      expect(wordHyphenationEngine.mock.calls[2][0]).toEqual('ipsum');
    });

    test('should return syllables when multipe runs string', () => {
      const result = defaultInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 5
            },
            {
              start: 5,
              end: 11
            }
          ]
        }
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(2);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 5);
      expect(result[0].runs[1]).toHaveProperty('start', 5);
      expect(result[0].runs[1]).toHaveProperty('end', 11);

      expect(wordHyphenationEngine.mock.calls).toHaveLength(3);
      expect(wordHyphenationEngine.mock.calls[0][0]).toEqual('Lorem');
      expect(wordHyphenationEngine.mock.calls[1][0]).toEqual(' ');
      expect(wordHyphenationEngine.mock.calls[2][0]).toEqual('ipsum');
    });

    test('should return syllables when single runs strings', () => {
      const result = defaultInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 11
            }
          ]
        },
        {
          string: 'dolor sit',
          runs: [
            {
              start: 0,
              end: 9
            }
          ]
        }
      ]);

      expect(result).toHaveLength(2);

      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(1);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 11);

      expect(result[1].syllables).toEqual(['dolor', ' ', 'sit']);
      expect(result[1].runs).toHaveLength(1);
      expect(result[1].runs[0]).toHaveProperty('start', 0);
      expect(result[1].runs[0]).toHaveProperty('end', 9);

      expect(wordHyphenationEngine.mock.calls).toHaveLength(6);
      expect(wordHyphenationEngine.mock.calls[0][0]).toEqual('Lorem');
      expect(wordHyphenationEngine.mock.calls[1][0]).toEqual(' ');
      expect(wordHyphenationEngine.mock.calls[2][0]).toEqual('ipsum');
      expect(wordHyphenationEngine.mock.calls[3][0]).toEqual('dolor');
      expect(wordHyphenationEngine.mock.calls[4][0]).toEqual(' ');
      expect(wordHyphenationEngine.mock.calls[5][0]).toEqual('sit');
    });

    test('should return mutated string if engine changes string value', () => {
      const result = mutateInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 11
            }
          ]
        }
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual(['Loremo', ' ', 'ipsumo']);
      expect(result[0].runs).toHaveLength(1);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 13);

      expect(mutateWordHyphenationEngine.mock.calls).toHaveLength(3);
      expect(mutateWordHyphenationEngine.mock.calls[0][0]).toEqual('Lorem');
      expect(mutateWordHyphenationEngine.mock.calls[1][0]).toEqual(' ');
      expect(mutateWordHyphenationEngine.mock.calls[2][0]).toEqual('ipsum');
    });
  });

  describe('when no engine provided', () => {
    test('should return no attributed strings if none provided', () => {
      const result = emptyInstance([]);
      expect(result).toEqual([]);
    });

    test('should return no syllables when empty string provided', () => {
      const result = emptyInstance([{ string: '', runs: [] }]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual([]);
      expect(result[0].string).toEqual('');
    });

    test('should return unhyphenated syllables when single run string', () => {
      const result = emptyInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 11
            }
          ]
        }
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(1);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 11);
    });

    test('should return unhyphenated syllables when multipe runs string', () => {
      const result = emptyInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 5
            },
            {
              start: 5,
              end: 11
            }
          ]
        }
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(2);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 5);
      expect(result[0].runs[1]).toHaveProperty('start', 5);
      expect(result[0].runs[1]).toHaveProperty('end', 11);
    });

    test('should return unhyphenated syllables when single runs strings', () => {
      const result = emptyInstance([
        {
          string: 'Lorem ipsum',
          runs: [
            {
              start: 0,
              end: 11
            }
          ]
        },
        {
          string: 'dolor sit',
          runs: [
            {
              start: 0,
              end: 9
            }
          ]
        }
      ]);

      expect(result).toHaveLength(2);

      expect(result[0].syllables).toEqual(['Lorem', ' ', 'ipsum']);
      expect(result[0].runs).toHaveLength(1);
      expect(result[0].runs[0]).toHaveProperty('start', 0);
      expect(result[0].runs[0]).toHaveProperty('end', 11);

      expect(result[1].syllables).toEqual(['dolor', ' ', 'sit']);
      expect(result[1].runs).toHaveLength(1);
      expect(result[1].runs[0]).toHaveProperty('start', 0);
      expect(result[1].runs[0]).toHaveProperty('end', 9);
    });
  });
});
