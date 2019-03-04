import sumRuns from './sumRuns';
import runAdvanceWidth from '../run/advanceWidth';

/**
 * Returns attributed string advancewidth
 *
 * @param {Object} attributed string
 * @return {number} advance width
 */
const advanceWidth = sumRuns(runAdvanceWidth);

export default advanceWidth;
