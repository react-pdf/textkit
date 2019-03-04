import * as R from 'ramda';

import scale from './scale';
// return this.attributes.font.descent * this.scale;

/**
 * Get run descent
 *
 * @param  {Object}  run
 * @return {number} descent
 */
const descent = R.converge(R.multiply, [
  scale,
  R.ifElse(R.has('attributes'), R.pathOr(0, ['attributes', 'font', 'descent']), R.always(0))
]);

export default descent;
