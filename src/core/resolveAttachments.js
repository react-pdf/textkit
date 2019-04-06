import * as R from 'ramda';

const ATTACHMENT_CODE = 0xfffc; // 65532

const mapIndexed = R.addIndex(R.map);
const getGlyphs = R.propOr([], 'glyphs');
const getAttachment = R.path(['attributes', 'attachment']);
const isReplaceGlyph = R.o(R.includes(ATTACHMENT_CODE), R.propOr([], 'codePoints'));

/**
 * Resolve attachments of run
 *
 * @param  {Object}  run
 * @return {Object} run
 */
const resolveRunAttachments = run => {
  const glyphs = getGlyphs(run);
  const attachment = getAttachment(run);

  return R.evolve({
    positions: mapIndexed((position, i) => {
      const glyph = glyphs[i];

      if (isReplaceGlyph(glyph)) {
        return R.evolve(
          {
            xAdvance: R.always(attachment.width)
          },
          position
        );
      }

      return position;
    })
  })(run);
};

/**
 * Resolve attachments for multiple paragraphs
 *
 * @param  {Object} layout engines
 * @param  {Array}  attributed strings (paragraphs)
 * @return {Array} attributed strings (paragraphs)
 */
const resolveAttachments = () =>
  R.map(
    R.evolve({
      runs: R.map(resolveRunAttachments)
    })
  );

export default resolveAttachments;
