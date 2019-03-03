import * as R from 'ramda';

/**
 * Checks if value is first of the list
 *
 * @param  {Array}  list
 * @param  {any}  value
 * @return {boolean} is first?
 */
const isFirstItem = R.converge(R.equals, [
  R.nthArg(1),
  R.compose(
    R.head,
    R.nthArg(0)
  )
]);

export default isFirstItem;
