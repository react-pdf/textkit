import * as R from 'ramda';

import runLength from '../run/length';
import runAdvanceWidth from '../run/advanceWidth';
import runIndexAtOffset from '../run/indexAtOffset';

/**
 * Get string index at offset
 *
 * @param  {Object}  attributed string
 * @param  {number}  offset
 * @return {number} string index at offset N
 */
const indexAtOffset = (offset, string) => {
  let index = 0;
  let counter = 0;

  const runs = R.propOr([], 'runs', string);

  for (const run of runs) {
    const advanceWidth = runAdvanceWidth(run);

    if (counter + advanceWidth > offset) {
      return index + runIndexAtOffset(offset - counter, run);
    }
    counter += advanceWidth;
    index += runLength(run);
  }

  return index;
};

export default R.curryN(2, indexAtOffset);
