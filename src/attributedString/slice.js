import * as R from 'ramda';

import copyRun from '../run/copy';
import sliceRun from '../run/slice';
import filterRuns from '../run/filter';
import subtractRun from '../run/subtract';
import mapIndexed from '../utils/mapIndexed';

const sliceRuns = (start, end) => runs => {
  const firstRun = a => sliceRun(start - a.start, end - a.start, a);
  const lastRun = a => sliceRun(0, end - a.start, a);
  const intermediateRun = a => copyRun(a);

  return mapIndexed([
    R.o(subtractRun(start), firstRun), // Slice first run
    R.o(subtractRun(start), intermediateRun), // Slice intermediate runs
    R.o(subtractRun(start), lastRun) // Slice last run
  ])(runs);
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
