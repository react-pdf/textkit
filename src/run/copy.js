import * as R from 'ramda';

/**
 * Deep clone run
 *
 * @param  {Object}  run
 * @return {Object} cloned run
 */
const copy = R.evolve({
  positions: R.clone,
  glyphIndices: R.clone,
  attributes: R.evolve({
    font: R.identity
  })
});

export default copy;
