import * as R from 'ramda';

import copy from './copy';
import glyphIndexAt from './glyphIndexAt';

/**
 * Extend glyph indices at the end with given length
 *
 * Ex. extendGlyphIndices(3, [0, 1, 2, 2]) => [0, 1, 2, 2, 3, 3, 3]
 *
 * @param  {number}  length
 * @param  {Array}  glyph indices
 * @return {Array}  extended glyph indices
 */
const extendGlyphIndices = length =>
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
 * Insert glyph to run in the given index
 *
 * @param  {number}  string index
 * @param  {Object}  glyph
 * @param  {Object}  run
 * @return {Object}  run with glyph
 */
const insertGlyph = (index, glyph, run) => {
  if (!glyph) return copy(run);

  const glyphIndex = glyphIndexAt(index, run);
  const glyphLength = R.length(glyph.codePoints);

  return R.evolve({
    glyphs: R.insert(glyphIndex, glyph),
    positions: R.insert(glyphIndex, { xAdvance: glyph.advanceWidth }),
    glyphIndices: R.compose(
      R.apply(R.useWith(R.concat, [extendGlyphIndices(glyphLength), R.map(R.inc)])),
      R.splitAt(index)
    )
  })(run);
};

/**
 * Insert either glyph or code point to tun in the given index
 *
 * @param  {number}  string index
 * @param  {Object | number}  glyph | codePoint
 * @param  {Object}  run
 * @return {Object}  run with glyph
 */
const insert = (index, value, run) => {
  const font = R.path(['attributes', 'font'])(run);

  // Insert code point
  if (R.is(Number, value)) {
    const glyph = font && value ? font.glyphForCodePoint(value) : null;
    return insertGlyph(index, glyph, run);
  }

  // Insert glyph
  return insertGlyph(index, value, run);
};

export default R.curryN(3, insert);
