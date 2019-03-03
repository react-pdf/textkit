import * as R from 'ramda';

import slice from './slice';

const testChar = R.test(/\S/g);

const findCharIndex = R.findIndex(testChar);

const findLastCharIndex = R.o(R.add(1), R.findLastIndex(testChar));

/**
 * Removes (strips) whitespace from both ends of the attributted string.
 *
 * @param  {Object}  attributedString
 * @return {Object} attributedString
 */
const trim = string => {
  const indices = R.compose(
    R.juxt([findCharIndex, findLastCharIndex]),
    R.prop('string')
  )(string);

  return R.apply(slice, indices)(string);
};

export default trim;
