import * as R from 'ramda';

import runIndexAt from './runIndexAt';
import insert from '../run/insert';
import appendToRun from '../run/append';
import copy from '../run/copy';

const mapCond = conds => R.addIndex(R.map)(R.cond(conds));

const stringFromCodePoints = codePoints => String.fromCodePoint(...codePoints);

const idxEquals = idx =>
  R.compose(
    R.equals(idx),
    R.nthArg(1)
  );

const idxGt = idx =>
  R.compose(
    R.gt(R.__, idx),
    R.nthArg(1)
  );

// TODO: move to separate module and add tests
// TODO: create prepend method for attributed string
const append = (glyph, string) => {
  const codePoints = R.propOr([], 'codePoints')(glyph);

  return R.evolve({
    string: R.concat(R.__, stringFromCodePoints(codePoints)),
    runs: R.converge(R.concat, [
      R.tail,
      R.compose(
        R.unapply(R.identity),
        appendToRun(glyph),
        R.last
      )
    ])
  })(string);
};

/**
 * Insert glyph into attributed string
 *
 * @param {number} index
 * @param {Object} glyph
 * @param {Object} attributed string
 * @return {Object} attributed string with new glyph
 */
const insertGlyph = (index, glyph, string) => {
  const runIndex = runIndexAt(index, string);

  if (runIndex === -1) {
    return append(glyph, string);
  }

  const codePoints = R.propOr([], 'codePoints')(glyph);
  const incRange = R.add(R.length(codePoints));

  return R.evolve({
    string: R.compose(
      R.join(''),
      R.insert(index, stringFromCodePoints(codePoints))
    ),
    runs: mapCond([
      [idxEquals(runIndex), run => insert(index - run.start, glyph)(run)],
      [
        idxGt(runIndex),
        R.evolve({
          start: incRange,
          end: incRange
        })
      ],
      [R.T, copy]
    ])
  })(string);
};

export default R.curryN(3, insertGlyph);
