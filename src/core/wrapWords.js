import fromFragments from '../../src/attributedString/fromFragments';

/**
 * Wrap words of attribute string
 * TODO: maybe add syllables to attributed string schema?
 *
 * @param  {Object}  attributed string
 * @return {Object} attributed string and syllables
 */
const wrapWords = engines => attributedString => {
  const syllables = [];
  const fragments = [];

  for (const run of attributedString.runs) {
    let string = '';
    const words = attributedString.string
      .slice(run.start, run.end)
      .split(/([ ]+)/g)
      .filter(Boolean);

    for (const word of words) {
      const parts = engines.wordHyphenation(word);
      syllables.push(...parts);
      string += parts.join('');
    }

    fragments.push({ string, attributes: run.attributes });
  }

  return {
    attributedString: fromFragments(fragments),
    syllables
  };
};

export default wrapWords;
