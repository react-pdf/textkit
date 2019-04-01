import * as R from 'ramda';

import wrapWords from './wrapWords';
// import typesetter from './typesetter';
import generateGlyphs from './generateGlyphs';
import resolveYOffset from './resolveYOffset';
import preprocessRuns from './preprocessRuns';
import splitParagraphs from './splitParagraphs';
import resolveAttachments from './resolveAttachments';
import applyDefaultStyles from './applyDefaultStyles';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */

const layoutEngine = (engines, attributedString, containers) =>
  R.compose(
    // typesetter(engines)(containers),
    resolveYOffset(engines),
    resolveAttachments(engines),
    generateGlyphs(engines),
    wrapWords(engines),
    splitParagraphs(engines),
    preprocessRuns(engines),
    applyDefaultStyles(engines)
  )(attributedString);

export default R.curryN(3, layoutEngine);
