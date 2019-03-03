import * as R from 'ramda';

/**
 * Checks if value is last of the list
 *
 * @param  {Array}  list
 * @param  {any}  value
 * @return {boolean} is last?
 */
const isLastItem = R.converge(R.equals, [
  R.nthArg(1),
  R.compose(
    R.last,
    R.nthArg(0)
  )
]);

export default isLastItem;
