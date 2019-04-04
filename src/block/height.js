import * as R from 'ramda';

/**
 * Returns block height
 *
 * @param {Array} line fragments
 * @return {number} lines height
 */
const height = R.compose(
  R.sum,
  R.map(R.prop('height')),
  R.pluck('rect')
);

export default height;
