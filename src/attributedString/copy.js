import * as R from 'ramda';

import copyRun from '../run/copy';

/**
 * Deep clone attributed string
 *
 * @param  {Object}  attributed string
 * @return {Object} cloned attributed string
 */
const copy = R.evolve({
  runs: R.map(copyRun)
});

export default copy;
