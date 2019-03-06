import * as R from 'ramda';

import count from '../utils/count';

/**
 * Get ligature offset by index
 *
 * Ex. ffi ligature
 *
 *   glyphs:         l  o  f  f  i  m
 *   glyphIndices:   0  1  2  2  2  3
 *   offset:         0  0  0  1  2  0
 *
 * @param  {number}  index
 * @param  {Object}  run
 * @return {number} ligature offset
 */
const offset = (index, string) => {
  const value = R.pathOr(null, ['glyphIndices', index], string);

  return R.compose(
    count(value),
    R.slice(0, index),
    R.propOr([], 'glyphIndices')
  )(string);
};

export default R.curryN(2, offset);
