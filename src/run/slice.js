import * as R from 'ramda';

import offset from './offset';
import sliceGlyph from '../glyph/slice';
import glyphIndexAt from './glyphIndexAt';
import mapIndexed from '../utils/mapIndexed';
import normalizeArray from '../utils/normalizeArray';

/**
 * Slice run between glyph indices range
 *
 * @param  {number}  start glyph index
 * @param  {number}  end glyph index
 * @param  {Object}  run
 * @return {Object} sliced run
 */
const slice = (start, end, string) => {
  const font = R.path(['attributes', 'font'])(string);

  // Get start ligature chunks (if any)
  const startOffset = offset(start, string);
  const startGlyphs = sliceGlyph(startOffset, Infinity, font);

  // Get end ligature chunks (if any)
  const endOffset = offset(end, string);
  const endGlyphs = sliceGlyph(0, endOffset, font);

  const glyphs = R.compose(
    R.apply(R.slice),
    R.juxt([
      glyphIndexAt(start), // start glyph index
      R.o(R.add(R.min(1, endOffset)), glyphIndexAt(end)), // end glyph index
      R.propOr([], ['glyphs'])
    ])
  )(string);

  return R.applySpec({
    start: R.o(R.add(start), R.prop('start')),
    end: R.compose(
      R.apply(R.min),
      R.juxt([
        R.prop('end'), // string.end
        R.o(R.add(end), R.prop('start')) // end + string.start
      ])
    ),
    glyphs: R.always(glyphs),
    positions: R.identity,
    glyphIndices: R.identity,
    attributes: R.prop('attributes')
  })(string);
};

export default R.curryN(3, slice);
