import * as R from 'ramda';

import advanceWidth from '../attributedString/advanceWidth';
import leadingOffset from '../attributedString/leadingOffset';
import trailingOffset from '../attributedString/trailingOffset';
import dropLast from '../attributedString/dropLast';

const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

// TODO: Make it immutable
const finalizeFragment = engines => (line, i, lines) => {
  const isLastFragment = i === lines.length - 1;
  const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
  const align = isLastFragment ? style.alignLastLine : style.align;

  // Remove new line char at the end of line
  if (R.last(line.string) === '\n') {
    line = dropLast(line);
  }

  // Ignore whitespace at the start and end of a line for alignment
  line.overflowLeft = line.overflowLeft || 0;
  line.overflowLeft += leadingOffset(line);

  line.overflowRight = line.overflowRight || 0;
  line.overflowRight += trailingOffset(line);

  line.box.x -= line.overflowLeft;
  line.box.width += line.overflowLeft + line.overflowRight;

  // Adjust line offset for alignment
  const lineAdvanceWidth = advanceWidth(line);
  const remainingWidth = line.box.width - lineAdvanceWidth;

  line.box.x += remainingWidth * ALIGNMENT_FACTORS[align];

  if (align === 'justify' || lineAdvanceWidth > line.box.width) {
    engines.justification(line);
  }
  // engines.decorationEngine(line);
  return line;
};

const finalizeFragments = (engines, blocks) =>
  R.map(R.addIndex(R.map)(finalizeFragment(engines)), blocks);

export default R.curryN(2, finalizeFragments);
