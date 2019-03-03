import * as R from 'ramda';

/**
 * Checks if run contains value
 *
 * @param  {number}  value
 * @param  {Object}  run
 * @return {boolean} runs contains value
 */
const contains = n => R.both(R.o(R.gte(n), R.prop('start')), R.o(R.lt(n), R.prop('end')));

export default contains;
