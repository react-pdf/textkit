import empty from '../../attributedString/empty';

/**
 * Resolve font runs in an AttributedString, grouping equal
 * runs and performing font substitution where necessary.
 *
 * @param  {Object}  layout options
 * @param  {Object}  attributed string
 * @return {Object} attributed string
 */
const fontSubstitution = () => ({ string, runs }) => {
  let lastFont = null;
  let lastIndex = 0;
  let index = 0;
  const res = [];

  if (!string) return empty();

  for (const run of runs) {
    const defaultFont = run.attributes.font;

    if (string.length === 0) {
      res.push({ start: 0, end: 0, attributes: { font: defaultFont } });
      break;
    }

    for (const char of string.slice(run.start, run.end)) {
      const font = defaultFont;

      if (font !== lastFont) {
        if (lastFont) {
          res.push({ start: lastIndex, end: index, attributes: { font: lastFont } });
        }

        lastFont = font;
        lastIndex = index;
      }

      index += char.length;
    }
  }

  if (lastIndex < string.length) {
    res.push({ start: lastIndex, end: string.length, attributes: { font: lastFont } });
  }

  return { string, runs: res };
};

export default fontSubstitution;
