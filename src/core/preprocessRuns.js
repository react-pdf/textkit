import * as R from 'ramda';

import omit from '../run/omit';
import flatten from '../run/flatten';
import empty from '../attributedString/empty';

const omitFont = R.evolve({ runs: R.map(omit('font')) });

/**
 * Performs font substitution and script itemization on attributed string
 *
 * @param  {Object}  engines
 * @param  {Object}  attributed string
 * @return {Object} processed attributed string
 */
const preprocessRuns = engines =>
  R.ifElse(
    R.isNil,
    empty,
    R.applySpec({
      string: R.prop('string'),
      runs: R.compose(
        flatten,
        R.flatten,
        R.pluck('runs'),
        R.juxt([engines.fontSubstitutionEngine, engines.scriptItemizer, omitFont])
      )
    })
  );

export default preprocessRuns;
