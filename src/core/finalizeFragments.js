import * as R from 'ramda';

const NEW_LINE = 10;
const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

const finalizeFragment = engines => (line, i, lines) => {
  const isLastFragment = i === lines.length - 1;
  const style = R.pathOr({}, ['runs', 0, 'attributes'], line);
  const align = isLastFragment ? style.alignLastLine : style.align;

  let start = 0;
  let end = line.length;

  // Remove new line char at the end of line
  // if (line.codePointAtGlyphIndex(line.length - 1) === NEW_LINE) {
  //   line.deleteGlyph(line.length - 1);
  // }

  // Ignore whitespace at the start and end of a line for alignment
  // while (line.isWhiteSpace(start)) {
  //   line.overflowLeft += line.getGlyphWidth(start++);
  // }

  // while (line.isWhiteSpace(end - 1)) {
  //   line.overflowRight += line.getGlyphWidth(--end);
  // }

  // line.rect.x -= line.overflowLeft;
  // line.rect.width += line.overflowLeft + line.overflowRight;

  // Adjust line offset for alignment
  // const remainingWidth = line.rect.width - line.advanceWidth;

  // line.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];
  // if (align === 'justify' || line.advanceWidth > line.rect.width) {
  //   engines.justificationEngine.justify(line, {
  //     factor: style.justificationFactor
  //   });
  // }

  // engines.decorationEngine(line);
  return line;
};

const finalizeFragments = (engines, lines) => R.addIndex(R.map)(finalizeFragment(engines), lines);

export default R.curryN(2, finalizeFragments);
