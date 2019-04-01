import * as R from 'ramda';

const resolveStringYOffset = string => {
  for (const run of string.runs) {
    const { font, yOffset } = run.attributes;
    if (!yOffset) continue;
    for (let i = 0; i < run.length; i++) {
      run.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }

  return string;
};

/**
 * Resolves yOffset for multiple paragraphs
 *
 * @param  {Object} layout engines
 * @param  {Array}  attributed strings (paragraphs)
 * @return {Array} attributed strings (paragraphs)
 */
const resolveYOffset = () => R.map(resolveStringYOffset);

export default resolveYOffset;
