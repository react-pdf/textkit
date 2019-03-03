import * as R from 'ramda';

import sort from './sort';
import isEmpty from './isEmpty';

const sortPoints = (a, b) => a[1] - b[1] || a[3] - b[3];

const mergeAttributes = (key, left, right) => (key === 'attributes' ? R.merge(left, right) : right);

const generatePoints = R.o(
  R.sort(sortPoints),
  R.addIndex(R.chain)((run, i) => [
    ['start', run.start, run.attributes, i],
    ['end', run.end, run.attributes, i]
  ])
);

const flattenEmptyRuns = R.compose(
  R.map(R.reduce(R.mergeDeepWithKey(mergeAttributes), {})),
  R.groupWith(R.eqProps('start'))
);

const flattenRegularRuns = runs => {
  const res = [];
  const points = generatePoints(runs);

  let start = -1;
  let attrs = {};
  const stack = [];

  for (const [type, offset, attributes] of points) {
    if (start !== -1 && start < offset) {
      res.push({ start, end: offset, attributes: attrs });
    }

    if (type === 'start') {
      stack.push(attributes);
      attrs = R.merge(attrs, attributes);
    } else {
      attrs = {};

      for (let i = 0; i < stack.length; i++) {
        if (stack[i] === attributes) {
          stack.splice(i--, 1);
        } else {
          attrs = R.merge(attrs, stack[i]);
        }
      }
    }

    start = offset;
  }

  return res;
};

/**
 * Flatten many runs
 *
 * @param  {Array}  runs
 * @return {Array} flatten runs
 */
const flatten = (runs = []) =>
  R.compose(
    sort,
    R.apply(R.useWith(R.concat, [flattenEmptyRuns, flattenRegularRuns])),
    R.partition(isEmpty)
  )(runs);

export default flatten;
