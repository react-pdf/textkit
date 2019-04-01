import * as R from 'ramda';

import resolveGlyphIndices from '../utils/resolveGlyphIndices';

/**
 * Generate glyphs for single attributed string
 *
 * @param  {Array}  attributed strings
 * @return {Array} attributed string with glyphs
 */
const stringToGlyphs = attributedString =>
  R.evolve({
    runs: R.map(run => {
      const { start, end, attributes = {} } = run;
      const { font, features, script } = attributes;

      if (!font) return { ...run, glyphs: [], glyphIndices: [], positions: [] };

      const string = attributedString.string.slice(start, end);
      const glyphRun = font.layout(string, features, script);
      const glyphIndices = resolveGlyphIndices(string, glyphRun.stringIndices);

      return {
        ...run,
        glyphIndices,
        glyphs: glyphRun.glyphs,
        positions: glyphRun.positions
      };
    })
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
