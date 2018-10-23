import ParagraphStyle from '../models/ParagraphStyle';
import Rect from '../geom/Rect';
import Block from '../models/Block';
import GlyphGenerator from './GlyphGenerator';
import Typesetter from './Typesetter';
import injectEngines from './injectEngines';

// 1. split into paragraphs
// 2. get bidi runs and paragraph direction
// 3. font substitution - map to resolved font runs
// 4. script itemization
// 5. font shaping - text to glyphs
// 6. line breaking
// 7. bidi reordering
// 8. justification

// 1. get a list of rectangles by intersecting path, line, and exclusion paths
// 2. perform line breaking to get acceptable break points for each fragment
// 3. ellipsize line if necessary
// 4. bidi reordering
// 5. justification

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */
export default class LayoutEngine {
  constructor(engines) {
    const injectedEngines = injectEngines(engines);
    this.glyphGenerator = new GlyphGenerator(injectedEngines);
    this.typesetter = new Typesetter(injectedEngines);
  }

  layout(attributedString, containers) {
    let start = 0;

    for (let i = 0; i < containers.length && start < attributedString.length; i++) {
      const container = containers[i];
      const { bbox, columns, columnGap } = container;
      const isLastContainer = i === containers.length - 1;
      const columnWidth = (bbox.width - columnGap * (columns - 1)) / columns;
      const rect = new Rect(bbox.minX, bbox.minY, columnWidth, bbox.height);

      for (let j = 0; j < container.columns && start < attributedString.length; j++) {
        start = this.layoutColumn(attributedString, start, container, rect.copy(), isLastContainer);
        rect.x += columnWidth + container.columnGap;
      }
    }
  }

  layoutColumn(attributedString, start, container, rect, isLastContainer) {
    while (start < attributedString.length && rect.height > 0) {
      let next = attributedString.string.indexOf('\n', start);
      if (next === -1) next = attributedString.string.length;

      const paragraph = attributedString.slice(start, next);
      const block = this.layoutParagraph(paragraph, container, rect, isLastContainer);
      const paragraphHeight = block.bbox.height + block.style.paragraphSpacing;

      container.blocks.push(block);

      rect.y += paragraphHeight;
      rect.height -= paragraphHeight;
      start += paragraph.length + 1;

      // If entire paragraph did not fit, move on to the next column or container.
      if (start < next) break;
    }

    return start;
  }

  layoutParagraph(attributedString, container, rect, isLastContainer) {
    const glyphString = this.glyphGenerator.generateGlyphs(attributedString);
    const paragraphStyle = new ParagraphStyle(attributedString.runs[0].attributes);
    const { marginLeft, marginRight, indent, maxLines, lineSpacing } = paragraphStyle;

    const lineRect = new Rect(
      rect.x + marginLeft + indent,
      rect.y,
      rect.width - marginLeft - indent - marginRight,
      glyphString.height
    );

    let pos = 0;
    let lines = 0;
    let firstLine = true;
    const fragments = [];

    while (lineRect.y < rect.maxY && pos < glyphString.length && lines < maxLines) {
      const lineFragments = this.typesetter.layoutLineFragments(
        pos,
        lineRect,
        glyphString,
        container,
        paragraphStyle
      );

      lineRect.y += lineRect.height + lineSpacing;

      if (lineFragments.length > 0) {
        fragments.push(...lineFragments);
        pos = lineFragments[lineFragments.length - 1].end;
        lines++;

        if (firstLine) {
          lineRect.x -= indent;
          lineRect.width += indent;
          firstLine = false;
        }
      }
    }

    // Add empty line fragment for empty glyph strings
    if (glyphString.length === 0) {
      const newLineFragment = this.typesetter.layoutLineFragments(
        pos,
        lineRect,
        glyphString,
        container,
        paragraphStyle
      );

      fragments.push(...newLineFragment);
    }

    const isTruncated = isLastContainer && pos < glyphString.length;
    fragments.forEach((fragment, i) => {
      const isLastFragment = i === fragments.length - 1 && pos === glyphString.length;

      this.typesetter.finalizeLineFragment(fragment, paragraphStyle, isLastFragment, isTruncated);
    });

    return new Block(fragments, paragraphStyle);
  }
}
