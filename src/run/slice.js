import * as R from 'ramda';

/**
 * Slice run between range
 *
 * @param  {number}  start
 * @param  {number}  end
 * @param  {Object}  run
 * @return {Object} sliced run
 */
const slice = (start, end, string) => {
  const base = string.start;

  return R.evolve({
    start: R.add(start),
    end: R.min(end + base)
  })(string);
};

export default R.curryN(3, slice);
