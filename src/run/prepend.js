import * as R from 'ramda';

import insert from './insert';

/**
 * Prepend glyph or code point on run
 *
 * @param  {Object | number}  glyph | codePoint
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const prepend = (glyph, run) => insert(0, glyph, run);

export default R.curryN(2, prepend);
