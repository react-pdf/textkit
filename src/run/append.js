import * as R from 'ramda';

import insert from './insert';

/**
 * Append glyph or code point on run
 *
 * @param  {Object | number}  glyph | codePoint
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const append = (glyph, run) => insert(run.end, glyph, run);

export default R.curryN(2, append);
