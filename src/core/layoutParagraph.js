import * as R from 'ramda';

import stringHeight from '../attributedString/height';

const ATTACHMENT_CODE = '\ufffc'; // 65532

const purgeAttachments = R.when(
  R.compose(
    R.not,
    R.includes(ATTACHMENT_CODE),
    R.prop('string')
  ),
  R.evolve({
    runs: R.map(R.evolve({ attributes: R.dissoc('attachment') }))
  })
);

/**
 * Layout paragraphs inside rectangle
 *
 * @param  {Object} rect
 * @param  {Object} attributed strings
 * @return {Object} layout blocks
 */
const layoutLines = (rect, lines) => {
  let currentY = rect.y;

  return R.map(
    R.compose(
      line => {
        const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
        const height = Math.max(stringHeight(line), style.lineHeight);
        const box = { x: rect.x, y: currentY, width: rect.width, height };

        currentY += height;

        return R.compose(
          R.assoc('box', box),
          R.omit(['syllables'])
        )(line);
      },
      purgeAttachments
    )
  )(lines);
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
