import * as R from 'ramda';

/**
 * Subtract scalar to run
 *
 * @param  {number}  scalar
 * @param  {Object}  run
 * @return {Object} subtracted run
 */
const subtract = (n, string) =>
  R.evolve({
    start: R.subtract(R.__, n),
    end: R.subtract(R.__, n)
  })(string);

export default R.curryN(2, subtract);
