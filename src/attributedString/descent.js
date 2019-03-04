import sumRuns from './sumRuns';
import runDescent from '../run/descent';

/**
 * Returns attributed string descent
 *
 * @param {Object} attributed string
 * @return {number} descent
 */
const descent = sumRuns(runDescent);

export default descent;
