import * as R from 'ramda';

/**
 * Test script itemizer based on the string 'Lorem'
 * Returns empty if no runs present, or arbitrary script itemization otherwise
 *
 *   L     o     r     e     m
 * |---- Latin ----|- Non-latin-|
 *
 * @param  {Object}  attributed string
 * @return {Object} attributed string
 */
const scriptItemizer = jest.fn(
  R.evolve({
    runs: R.ifElse(
      R.isEmpty,
      R.always([]),
      R.always([
        { start: 0, end: 3, attributes: { script: 'Latin' } },
        { start: 3, end: 5, attributes: { script: 'Non-latin' } }
      ])
    )
  })
);

export default scriptItemizer;
