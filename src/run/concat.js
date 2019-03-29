import * as R from 'ramda';

import length from './length';

const reverseMerge = R.flip(R.merge);
const reverseConcat = R.flip(R.concat);

/**
 * Concats two runs into one
 *
 * @param  {Object}  first run
 * @param  {Object}  second run
 * @return {Object}  concatenated run
 */
const concat = (runA, runB) =>
  R.evolve({
    end: R.add(length(runB)),
    glyphs: reverseConcat(R.prop('glyphs', runB)),
    positions: reverseConcat(R.prop('positions', runB)),
    attributes: reverseMerge(R.prop('attributes', runB)),
    glyphIndices: reverseConcat(
      R.map(
        R.add(R.last(R.propOr([], 'glyphIndices', runA)) + 1), // index + last(runA) + 1
        R.propOr([], 'glyphIndices', runB)
      )
    )
  })(runA);

export default R.curryN(2, concat);
