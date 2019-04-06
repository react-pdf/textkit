import * as R from 'ramda';

import scale from '../run/scale';
import resolveGlyphIndices from '../indices/resolve';

const mapIndexed = R.addIndex(R.map);
const getCharacterSpacing = R.pathOr(0, ['attributes', 'characterSpacing']);

/**
 * Scale run positions
 *
 * @param  {Object}  run
 * @param  {Array}  positions
 * @return {Array} scaled positions
 */
const scalePositions = (run, positions) => {
  const multScale = R.multiply(scale(run));
  const characterSpacing = getCharacterSpacing(run);

  return mapIndexed((pos, i, list) => {
    const isLast = i === list.length - 1;

    return R.evolve({
      xAdvance: R.compose(
        R.when(
          R.always(!isLast),
          R.add(characterSpacing) // Add char spacing
        ),
        multScale
      ),
      yAdvance: multScale,
      xOffset: multScale,
      yOffset: multScale
    })(pos);
  }, positions);
};

/**
 * Create glyph run
 *
 * @param  {String}  string
 * @param  {Object}  run
 * @return {Object}  glyph run
 */
const layoutRun = string => run => {
  const { start, end, attributes = {} } = run;
  const { font, features, script } = attributes;

  if (!font) return { ...run, glyphs: [], glyphIndices: [], positions: [] };

  const runString = string.slice(start, end);
  const glyphRun = font.layout(runString, features, script);
  const positions = scalePositions(run, glyphRun.positions);
  const glyphIndices = resolveGlyphIndices(runString, glyphRun.stringIndices);

  return {
    ...run,
    positions,
    glyphIndices,
    glyphs: glyphRun.glyphs
  };
};

/**
 * Generate glyphs for single attributed string
 *
 * @param  {Array}  attributed strings
 * @return {Array} attributed string with glyphs
 */
const stringToGlyphs = attributedString =>
  R.evolve({
    runs: R.map(layoutRun(attributedString.string))
  })(attributedString);

/**
 * Generate glyphs for multiple paragraphs
 *
 * @param  {Object} layout engines
 * @param  {Array}  attributed strings (paragraphs)
 * @return {Array} attributed strings with glyphs
 */
const generateGlyphs = () => R.map(stringToGlyphs);

export default generateGlyphs;
