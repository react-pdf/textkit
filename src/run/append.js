import * as R from 'ramda';

import copy from './copy';
import isNumber from '../utils/isNumber';
import glyphFromCodePoint from '../glyph/fromCodePoint';

/**
 * Append glyph indices with given length
 *
 * Ex. appendIndices(3, [0, 1, 2, 2]) => [0, 1, 2, 2, 3, 3, 3]
 *
 * @param  {number}  length
 * @param  {Array}  glyph indices
 * @return {Array}  extended glyph indices
 */
const appendIndices = length =>
  R.converge(R.concat, [
    R.identity,
    R.converge(R.repeat, [
      R.either(
        R.o(R.inc, R.last), // Value should be last plus 1
        R.always(0) // Or zero if inserting at beggining
      ),
      R.always(length)
    ])
  ]);

/**
 * Append glyph to run
 *
 * @param  {Object}  glyph
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const appendGlyph = (glyph, run) => {
  const glyphLength = R.length(glyph.codePoints);

  return R.evolve({
    end: R.add(glyphLength),
    glyphs: R.append(glyph),
    glyphIndices: appendIndices(glyphLength),
    positions: R.append({ xAdvance: glyph.advanceWidth })
  })(run);
};

/**
 * Append glyph or code point to run
 *
 * @param  {Object | number}  glyph | codePoint
 * @param  {Object}  run
 * @return {Object} run with glyph
 */
const append = (value, run) => {
  if (!value) return copy(run);

  const font = R.path(['attributes', 'font'], run);
  const glyph = isNumber(value) ? glyphFromCodePoint(value, font) : value;

  return appendGlyph(glyph, run);
};

export default R.curryN(2, append);
