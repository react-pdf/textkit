import * as R from 'ramda';

import copy from './copy';
import isNumber from '../utils/isNumber';
import glyphFromCodePoint from '../glyph/fromCodePoint';

/**
 * Prepend glyph indices with given length
 *
 * Ex. prependIndices(3, [0, 1, 2, 2]) => [0, 0, 0, 1, 2, 3, 4]
 *
 * @param  {number}  length
 * @param  {Array}  glyph indices
 * @return {Array}  extended glyph indices
 */
const prependIndices = length =>
  R.converge(R.concat, [R.converge(R.repeat, [R.always(0), R.always(length)]), R.map(R.inc)]);

/**
 * Prepend glyph to run
 *
 * @param  {Object}  glyph
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const prependGlyph = (glyph, run) => {
  const glyphLength = R.length(glyph.codePoints);

  return R.evolve({
    end: R.add(glyphLength),
    glyphIndices: prependIndices(glyphLength),
    glyphs: R.prepend(glyph),
    positions: R.prepend({ xAdvance: glyph.advanceWidth })
  })(run);
};

/**
 * Prepend glyph or code point on run
 *
 * @param  {Object | number}  glyph | codePoint
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const prepend = (value, run) => {
  if (!value) return copy(run);

  const font = R.path(['attributes', 'font'], run);
  const glyph = isNumber(value) ? glyphFromCodePoint(value, font) : value;

  return prependGlyph(glyph, run);
};

export default R.curryN(2, prepend);
