import * as R from 'ramda';

import copy from '../attributedString/copy';

const ATTACHMENT_CODE = 0xfffc; // 65532

/**
 * Resolve attachments of attributed string
 *
 * @param  {Object}  attributed string
 * @return {Object} attributed string
 */
const resolveStringAttachments = string => {
  const newString = copy(string);

  for (const run of newString.runs) {
    const glyphs = R.propOr([], 'glyphs', run);
    const attachment = R.path(['attributes', 'attachment'], run);

    if (!attachment || !glyphs) continue;

    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const position = R.path(['positions', i], run);

      if (position && R.includes(ATTACHMENT_CODE, glyph.codePoints)) {
        position.xAdvance = attachment.width;
      }
    }
  }

  return newString;
};

/**
 * Resolve attachments for multiple paragraphs
 *
 * @param  {Object} layout engines
 * @param  {Array}  attributed strings (paragraphs)
 * @return {Array} attributed strings (paragraphs)
 */
const resolveAttachments = () => R.map(resolveStringAttachments);

export default resolveAttachments;
