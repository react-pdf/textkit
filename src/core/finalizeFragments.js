import * as R from 'ramda';

import copy from '../attributedString/copy';
import length from '../attributedString/length';
import dropLast from '../attributedString/dropLast';

const NEW_LINE = 10;
const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

const finalizeFragment = engines => (line, i, lines) => {
  let newLine = copy(line);

  const isLastFragment = i === lines.length - 1;
  const style = R.pathOr({}, ['runs', 0, 'attributes'], newLine);
  const align = isLastFragment ? style.alignLastLine : style.align;

  const start = 0;
  const end = length(newLine);

  // Remove new line char at the end of line
  if (R.last(newLine.string) === '\n') {
    newLine = dropLast(line);
  }

  // Ignore whitespace at the start and end of a line for alignment
  // while (line.isWhiteSpace(start)) {
  //   line.overflowLeft += line.getGlyphWidth(start++);
  // }

  // while (line.isWhiteSpace(end - 1)) {
  //   line.overflowRight += line.getGlyphWidth(--end);
  // }

  // line.rect.x -= line.overflowLeft;
  // line.rect.width += line.overflowLeft + line.overflowRight;

  // Adjust line offset for alignment
  // const remainingWidth = line.rect.width - line.advanceWidth;

  // line.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];
  // if (align === 'justify' || line.advanceWidth > line.rect.width) {
  //   engines.justificationEngine.justify(line, {
  //     factor: style.justificationFactor
  //   });
  // }

  // engines.decorationEngine(line);
  return newLine;
};

const finalizeFragments = (engines, blocks) =>
  R.map(R.addIndex(R.map)(finalizeFragment(engines)), blocks);

export default R.curryN(2, finalizeFragments);
