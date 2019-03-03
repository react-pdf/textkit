import * as R from 'ramda';

import copyRun from '../run/copy';
import sliceRun from '../run/slice';
import filterRuns from '../run/filter';
import subtractRun from '../run/subtract';
import isFirstItem from '../utils/isFirstItem';
import isLastItem from '../utils/isLastItem';

const sliceRuns = (start, end) => runs => {
  const firstRun = a => sliceRun(start - a.start, end - a.start, a);
  const lastRun = a => sliceRun(0, end - a.start, a);
  const intermediateRun = a => copyRun(a);

  return R.map(
    R.compose(
      subtractRun(start),
      R.cond([[isFirstItem(runs), firstRun], [isLastItem(runs), lastRun], [R.T, intermediateRun]])
    )
  )(runs);
};

/**
 * Slice attributed string between two indices
 *
 * @param  {number}  start offset
 * @param  {number}  end offset
 * @param  {Object}  attributedString
 * @return {Object} attributedString
 */
const slice = (start, end, string) =>
  R.ifElse(
    R.pathEq(['string', 'length'], 0),
    R.identity,
    R.evolve({
      string: R.slice(start, end),
      runs: R.compose(
        sliceRuns(start, end),
        filterRuns(start, end)
      )
    })
  )(string);

export default R.curryN(3, slice);
