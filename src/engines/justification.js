import * as R from 'ramda';

import isWhiteSpace from '../glyph/isWhiteSpace';
import advanceWidth from '../attributedString/advanceWidth';

const { clone } = R;

const KASHIDA_PRIORITY = 0;
const WHITESPACE_PRIORITY = 1;
const LETTER_PRIORITY = 2;
const NULL_PRIORITY = 3;

const EXPAND_WHITESPACE_FACTOR = {
  before: 0.5,
  after: 0.5,
  priority: WHITESPACE_PRIORITY,
  unconstrained: false
};

const EXPAND_CHAR_FACTOR = {
  before: 0.14453125, // 37/256
  after: 0.14453125,
  priority: LETTER_PRIORITY,
  unconstrained: false
};

const SHRINK_WHITESPACE_FACTOR = {
  before: -0.04296875, // -11/256
  after: -0.04296875,
  priority: WHITESPACE_PRIORITY,
  unconstrained: false
};

const SHRINK_CHAR_FACTOR = {
  before: -0.04296875,
  after: -0.04296875,
  priority: LETTER_PRIORITY,
  unconstrained: false
};

const getCharFactor = (direction, options) => {
  const expandCharFactor = R.propOr({}, 'expandCharFactor', options);
  const shrinkCharFactor = R.propOr({}, 'shrinkCharFactor', options);

  return direction === 'GROW'
    ? R.merge(EXPAND_CHAR_FACTOR, expandCharFactor)
    : R.merge(SHRINK_CHAR_FACTOR, shrinkCharFactor);
};

const getWhitespaceFactor = (direction, options) => {
  const expandWhitespaceFactor = R.propOr({}, 'expandWhitespaceFactor', options);
  const shrinkWhitespaceFactor = R.propOr({}, 'shrinkWhitespaceFactor', options);

  return direction === 'GROW'
    ? R.merge(EXPAND_WHITESPACE_FACTOR, expandWhitespaceFactor)
    : R.merge(SHRINK_WHITESPACE_FACTOR, shrinkWhitespaceFactor);
};

const factor = (direction, options) => glyphs => {
  const charFactor = getCharFactor(direction, options);
  const whitespaceFactor = getWhitespaceFactor(direction, options);

  const factors = [];
  for (let index = 0; index < glyphs.length; index++) {
    let f;
    const glyph = glyphs[index];

    if (isWhiteSpace(glyph)) {
      f = clone(whitespaceFactor);

      if (index === glyphs.length - 1) {
        f.before = 0;

        if (index > 0) {
          factors[index - 1].after = 0;
        }
      }
    } else if (glyph.isMark && index > 0) {
      f = clone(factors[index - 1]);
      f.before = 0;
      factors[index - 1].after = 0;
    } else {
      f = clone(charFactor);
    }

    factors.push(f);
  }

  return factors;
};

const assign = (gap, factors) => {
  let total = 0;
  const priorities = [];
  const unconstrained = [];

  for (let priority = KASHIDA_PRIORITY; priority <= NULL_PRIORITY; priority++) {
    priorities[priority] = unconstrained[priority] = 0;
  }

  // sum the factors at each priority
  for (let j = 0; j < factors.length; j++) {
    const f = factors[j];
    const sum = f.before + f.after;
    total += sum;
    priorities[f.priority] += sum;
    if (f.unconstrained) {
      unconstrained[f.priority] += sum;
    }
  }

  // choose the priorities that need to be applied
  let highestPriority = -1;
  let highestPrioritySum = 0;
  let remainingGap = gap;
  let priority;
  for (priority = KASHIDA_PRIORITY; priority <= NULL_PRIORITY; priority++) {
    const prioritySum = priorities[priority];
    if (prioritySum !== 0) {
      if (highestPriority === -1) {
        highestPriority = priority;
        highestPrioritySum = prioritySum;
      }

      // if this priority covers the remaining gap, we're done
      if (Math.abs(remainingGap) <= Math.abs(prioritySum)) {
        priorities[priority] = remainingGap / prioritySum;
        unconstrained[priority] = 0;
        remainingGap = 0;
        break;
      }

      // mark that we need to use 100% of the adjustment from
      // this priority, and subtract the space that it consumes
      priorities[priority] = 1;
      remainingGap -= prioritySum;

      // if this priority has unconstrained glyphs, let them consume the remaining space
      if (unconstrained[priority] !== 0) {
        unconstrained[priority] = remainingGap / unconstrained[priority];
        remainingGap = 0;
        break;
      }
    }
  }

  // zero out remaining priorities (if any)
  for (let p = priority + 1; p <= NULL_PRIORITY; p++) {
    priorities[p] = 0;
    unconstrained[p] = 0;
  }

  // if there is still space left over, assign it to the highest priority that we saw.
  // this violates their factors, but it only happens in extreme cases
  if (remainingGap > 0 && highestPriority > -1) {
    priorities[highestPriority] = (highestPrioritySum + (gap - total)) / highestPrioritySum;
  }

  // create and return an array of distances to add to each glyph's advance
  const distances = [];
  for (let index = 0; index < factors.length; index++) {
    // the distance to add to this glyph is the sum of the space to add
    // after this glyph, and the space to add before the next glyph
    const f = factors[index];
    const next = factors[index + 1];
    let dist = f.after * priorities[f.priority];

    if (next) {
      dist += next.before * priorities[next.priority];
    }

    // if this glyph is unconstrained, add the unconstrained distance as well
    if (f.unconstrained) {
      dist += f.after * unconstrained[f.priority];
      if (next) {
        dist += next.before * unconstrained[next.priority];
      }
    }

    distances.push(dist);
  }

  return distances;
};

const getFactors = (gap, line, options) => {
  const direction = gap > 0 ? 'GROW' : 'SHRINK';
  const getFactor = factor(direction, options);

  const concatFactors = R.useWith(R.concat, [
    R.identity,
    R.compose(
      getFactor,
      R.prop('glyphs')
    )
  ]);

  return R.compose(
    R.adjust(-1, R.assoc('after', 0)),
    R.adjust(0, R.assoc('before', 0)),
    R.reduce(concatFactors, []),
    R.prop('runs')
  )(line);
};

const justifyLine = (distances, line) => {
  let index = 0;
  for (const run of line.runs) {
    for (const position of run.positions) {
      position.xAdvance += distances[index++];
    }
  }

  return line;
};

/**
 * A JustificationEngine is used by a Typesetter to perform line fragment
 * justification. This implementation is based on a description of Apple's
 * justification algorithm from a PDF in the Apple Font Tools package.
 *
 * //TODO: Make it immutable
 *
 * @param {Object} layout options
 * @param {Object} line
 * @returns {Object} line
 */
const justification = options => line => {
  const gap = line.box.width - advanceWidth(line);

  if (gap === 0) return; // Exact fit

  const factors = getFactors(gap, line, options);
  const distances = assign(gap, factors);

  return justifyLine(distances, line);
};

export default justification;
