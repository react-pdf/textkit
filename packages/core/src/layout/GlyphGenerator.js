/**
 * A GlyphGenerator is responsible for mapping characters in
 * an AttributedString to glyphs in a GlyphString. It resolves
 * style attributes such as the font and Unicode script and
 * directionality properties, and creates GlyphRuns using fontkit.
 */
export default class GlyphGenerator {
  resolveAttachments(glyphRun) {
    const { font, attachment } = glyphRun.attributes;

    if (!attachment) {
      return;
    }

    const objectReplacement = font.glyphForCodePoint(0xfffc);

    for (let i = 0; i < glyphRun.length; i++) {
      const glyph = glyphRun.glyphs[i];
      const position = glyphRun.positions[i];

      if (glyph === objectReplacement) {
        position.xAdvance = attachment.width;
      }
    }
  }

  resolveYOffset(glyphRun) {
    const { font, yOffset } = glyphRun.attributes;

    if (!yOffset) {
      return;
    }

    for (let i = 0; i < glyphRun.length; i++) {
      glyphRun.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }
}
