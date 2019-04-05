import * as R from 'ramda';

import wrapWords from './wrapWords';
import typesetter from './typesetter';
import generateGlyphs from './generateGlyphs';
import resolveYOffset from './resolveYOffset';
import preprocessRuns from './preprocessRuns';
import splitParagraphs from './splitParagraphs';
// import finalizeFragments from './finalizeFragments';
import resolveAttachments from './resolveAttachments';
import applyDefaultStyles from './applyDefaultStyles';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a Container object
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 *
 * @param  {Object}  engines
 * @param  {Object}  attributted string
 * @param  {Object}  container rect
 * @return {Array} paragraph blocks
 */
const layoutEngine = (engines, attributedString, container) =>
  R.compose(
    // finalizeFragments(engines),
    typesetter(engines)(container),
    // R.tap(a => {
    //   console.log(a[0].runs);

    // }),
    resolveYOffset(engines),
    resolveAttachments(engines),
    generateGlyphs(engines),
    wrapWords(engines),
    splitParagraphs(engines),
    preprocessRuns(engines),
    applyDefaultStyles(engines)
  )(attributedString);

export default R.curryN(3, layoutEngine);
