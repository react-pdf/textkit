import * as R from 'ramda';

import copy from '../attributedString/copy';

/**
 * Resolves yOffset for attributed string
 *
 * @param  {Object}  attributed string
 * @return {Object} attributed string
 */
const resolveStringYOffset = string => {
  const newString = copy(string);

  for (const run of newString.runs) {
    const font = R.path(['attributes', 'font'], run);
    const yOffset = R.path(['attributes', 'yOffset'], run);
    const positions = R.prop('positions', run);

    if (!yOffset || !font || !positions) continue;

    for (const position of run.positions) {
      position.yOffset = position.yOffset || 0;
      position.yOffset += yOffset * font.unitsPerEm;
    }
  }

  return newString;
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
