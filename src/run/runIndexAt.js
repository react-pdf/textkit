import * as R from 'ramda';

/**
 * Get run index that contains passed index
 *
 * @param  {number}  char index
 * @param  {Array}  runs array
 * @return {Array} run index
 */
const runIndexAt = (n, runs) =>
  R.findIndex(R.both(R.o(R.gte(n), R.prop('start')), R.o(R.lt(n), R.prop('end'))))(runs);

export default R.curryN(2, runIndexAt);
