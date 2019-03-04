import * as R from 'ramda';

/**
 * Sum run function results
 *
 * @param {function} function run (run) -> Number
 * @param {number} initial value
 * @return {number} sum
 */
const sumRuns = (fn, init = 0) =>
  R.compose(
    R.reduce(R.useWith(R.add, [R.identity, fn]), init),
    R.prop('runs')
  );

export default sumRuns;
