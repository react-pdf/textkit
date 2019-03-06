import * as R from 'ramda';

/**
 * Returns new array starting with zero, and keeping same relation between consecutive values
 *
 * @param  {Array[number]}  list
 * @return {boolean} normalized array
 */
const normalizeArray = array => R.map(R.subtract(R.__, R.head(array)))(array);

export default normalizeArray;
