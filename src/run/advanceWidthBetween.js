import * as R from 'ramda';

import glyphIndexAt from './glyphIndexAt';

/**
 * Advance width between two string indices
 *
 * @param  {number}  start glyph index
 * @param  {number}  end glyph index
 * @param  {Object}  run
 * @return {Object} advanced width run
 */
const advanceWidthBetween = (start, end, run) => {
  const runStart = R.propOr(0, 'start', run);
  const glyphStartIndex = glyphIndexAt(start - runStart, run);
  const glyphEndIndex = glyphIndexAt(end - runStart, run);

  return R.compose(
    R.reduce(R.useWith(R.add, [R.identity, R.propOr(0, 'xAdvance')]), 0),
    R.slice(glyphStartIndex, glyphEndIndex),
    R.propOr([], 'positions')
  )(run);
};

export default advanceWidthBetween;
