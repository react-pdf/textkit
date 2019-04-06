import * as R from 'ramda';

import wrapWords from './wrapWords';
import typesetter from './typesetter';
import generateGlyphs from './generateGlyphs';
import resolveYOffset from './resolveYOffset';
import preprocessRuns from './preprocessRuns';
import splitParagraphs from './splitParagraphs';
import finalizeFragments from './finalizeFragments';
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
const layoutEngine = (engines, attributedString, container) => {
  let wrapPerformance;
  let glyphsPerformance;
  let attachmentsPerformance;
  let yOffsetPerformance;
  let typesetterPerformance;

  return R.compose(
    finalizeFragments(engines),
    R.tap(() => {
      const hrend = process.hrtime(typesetterPerformance);
      console.info('Typesetter: %dms', hrend[1] / 1000000);
    }),
    typesetter(engines)(container),
    R.tap(() => {
      typesetterPerformance = process.hrtime();
      const hrend = process.hrtime(yOffsetPerformance);
      console.info('YOffset: %dms', hrend[1] / 1000000);
    }),
    resolveYOffset(engines),
    R.tap(() => {
      yOffsetPerformance = process.hrtime();
      const hrend = process.hrtime(attachmentsPerformance);
      console.info('Attachments: %dms', hrend[1] / 1000000);
    }),
    resolveAttachments(engines),
    R.tap(() => {
      attachmentsPerformance = process.hrtime();
      const hrend = process.hrtime(glyphsPerformance);
      console.info('Glyphs: %dms', hrend[1] / 1000000);
    }),
    generateGlyphs(engines),
    R.tap(() => {
      glyphsPerformance = process.hrtime();
      const hrend = process.hrtime(wrapPerformance);
      console.info('Wrapping: %dms', hrend[1] / 1000000);
    }),
    wrapWords(engines),
    R.tap(() => {
      wrapPerformance = process.hrtime();
    }),
    splitParagraphs(engines),
    preprocessRuns(engines),
    applyDefaultStyles(engines)
  )(attributedString);
};

export default R.curryN(3, layoutEngine);
