import * as R from 'ramda';

const shortLigature = { id: 64257, codePoints: [102, 105], advanceWidth: 10 };
const longLigature = { id: 64259, codePoints: [102, 102, 105], advanceWidth: 10 };

const glyphForCodePoint = R.cond([
  [R.equals(64257), R.always(shortLigature)],
  [R.equals(64259), R.always(longLigature)],
  [R.T, R.applySpec({ id: R.identity, codePoints: R.of, advanceWidth: R.always(8) })]
]);

const glyphFromChar = R.compose(
  glyphForCodePoint,
  s => s.codePointAt(0)
);

const layoutGlyphs = R.cond([
  [R.equals('fi'), R.always([shortLigature])],
  [R.equals('ffi'), R.always([longLigature])],
  [R.T, R.map(glyphFromChar)]
]);

const layout = R.applySpec({
  glyphs: layoutGlyphs
});

export default {
  layout,
  glyphForCodePoint,
  unitsPerEm: 2
};
