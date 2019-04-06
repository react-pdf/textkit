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

// Remove new line char at the end of line
const removeNewLine = R.when(
  R.compose(
    R.equals('\n'),
    R.last,
    R.prop('string')
  ),
  dropLast
);

// Ignore whitespace at the start and end of a line for alignment
const adjustOverflow = line => {
  const overflowLeft = R.converge(R.add, [R.propOr(0, 'overflowLeft'), leadingOffset])(line);
  const overflowRight = R.converge(R.add, [R.propOr(0, 'overflowRight'), trailingOffset])(line);

  return R.evolve(
    {
      overflowLeft: R.always(overflowLeft),
      overflowRight: R.always(overflowRight),
      box: R.evolve({
        x: R.subtract(R.__, overflowLeft),
        width: R.add(overflowLeft + overflowRight)
      })
    },
    line
  );
};

const justifyLine = (engines, align) => line => {
  const lineAdvanceWidth = advanceWidth(line);
  const remainingWidth = line.box.width - lineAdvanceWidth;
  const shouldJustify = align === 'justify' || lineAdvanceWidth > line.box.width;

  return R.compose(
    R.when(R.always(shouldJustify), engines.justification),
    R.evolve({ box: R.evolve({ x: R.add(remainingWidth * ALIGNMENT_FACTORS[align]) }) })
  )(line);
};

const decorateLine = engines => line =>
  // engines.decorationEngine(line);
  line;

const finalizeBlock = engines => (line, i, lines) => {
  const isLastFragment = i === lines.length - 1;
  const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
  const align = isLastFragment ? style.alignLastLine : style.align;

  return R.compose(
    decorateLine(engines),
    justifyLine(engines, align),
    adjustOverflow,
    removeNewLine
  )(line);
};

const finalizeFragments = (engines, blocks) =>
  R.map(R.addIndex(R.map)(finalizeBlock(engines)), blocks);

export default R.curryN(2, finalizeFragments);
