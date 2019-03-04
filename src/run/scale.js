import * as R from 'ramda';

const unitsPerEm = ['font', 'unitsPerEm'];

/**
 * Get run scale
 *
 * @param  {Object}  run
 * @return {number} scale
 */
const scale = R.compose(
  R.ifElse(
    R.hasPath(unitsPerEm),
    R.converge(R.divide, [R.propOr(0, 'fontSize'), R.path(unitsPerEm)]),
    R.always(0)
  ),
  R.propOr({}, 'attributes')
);

export default scale;
