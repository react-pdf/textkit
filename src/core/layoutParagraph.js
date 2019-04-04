import * as R from 'ramda';

import stringHeight from '../attributedString/height';

/**
 * Layout paragraphs inside rectangle
 *
 * @param  {Object} rect
 * @param  {Object} attributed strings
 * @return {Object} layout blocks
 */
const layoutLines = (rect, lines) => {
  let currentY = rect.y;

  const lineFragments = lines.map(line => {
    const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
    const height = Math.max(stringHeight(line), style.lineHeight);
    const lineBox = { x: rect.x, y: currentY, width: rect.width, height };

    currentY += height;

    return { rect: lineBox, glyphString: R.omit(['syllables'], line) };
  });

  return lineFragments;
};

/**
 * Performs line breaking and layout
 *
 * @param  {Object} engines
 * @param  {Object} rect
 * @param  {Object} attributed string
 * @return {Object} layout block
 */
const layoutParagraph = engines => (rect, paragraph) => {
  const lines = engines.lineBreaker(paragraph, [rect.width]);
  const lineFragments = layoutLines(rect, lines);
  return lineFragments;
};

export default layoutParagraph;
