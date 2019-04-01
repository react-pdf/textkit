import * as R from 'ramda';

const ATTACHMENT_CODE = 0xfffc;

const resolveStringAttachments = string => {
  for (const run of string.runs) {
    const { font, attachment } = run.attributes;

    if (!attachment) continue;

    const objectReplacement = font.glyphForCodePoint(ATTACHMENT_CODE);

    for (let i = 0; i < run.length; i++) {
      const glyph = run.glyphs[i];
      const position = run.positions[i];

      if (glyph.id === objectReplacement.id) {
        position.xAdvance = attachment.width;
      }
    }
  }

  return string;
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
