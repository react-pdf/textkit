import AttributedString from '../models/AttributedString';
import FontDescriptor from '../models/FontDescriptor';
import GlyphGenerator from './GlyphGenerator';
import Typesetter from './Typesetter';
import injectEngines from './injectEngines';
import flattenRuns from './flattenRuns';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */

const applyDefaultStyles = attributedString => {
  const runs = attributedString.runs.map(run => {
    const { start, end, attributes } = run;
    return {
      start,
      end,
      attributes: {
        color: attributes.color || 'black',
        backgroundColor: attributes.backgroundColor || null,
        fontDescriptor: FontDescriptor.fromAttributes(attributes),
        font: attributes.font || null,
        fontSize: attributes.fontSize || 12,
        lineHeight: attributes.lineHeight || null,
        underline: attributes.underline || false,
        underlineColor: attributes.underlineColor || attributes.color || 'black',
        underlineStyle: attributes.underlineStyle || 'solid',
        strike: attributes.strike || false,
        strikeColor: attributes.strikeColor || attributes.color || 'black',
        strikeStyle: attributes.strikeStyle || 'solid',
        link: attributes.link || null,
        fill: attributes.fill !== false,
        stroke: attributes.stroke || false,
        features: attributes.features || [],
        wordSpacing: attributes.wordSpacing || 0,
        yOffset: attributes.yOffset || 0,
        characterSpacing: attributes.characterSpacing || 0,
        attachment: attributes.attachment || null,
        script: attributes.script || null,
        bidiLevel: attributes.bidiLevel || null
      }
    };
  });

  return new AttributedString(attributedString.string, runs);
};

const fontSubstitution = engines => attributedString =>
  engines.fontSubstitutionEngine.getRuns(attributedString.string, attributedString.runs);

const scriptItemization = engines => attributedString =>
  engines.scriptItemizer.getRuns(attributedString.string);

const splitParagraphs = () => attributedString => {
  let index = 0;
  const paragraps = attributedString.string.split(/(.*\n{1})/g).filter(Boolean);

  return paragraps.map(string => {
    const paragraph = attributedString.slice(index, index + string.length);
    index += string.length;
    return paragraph;
  });
};

const wrapWords = engines => paragraphs => {
  const wrappedParagraphs = [];

  for (const paragraph of paragraphs) {
    let index = 0;
    const wrappedParagraph = [];
    const tokens = paragraph.string.split(/([ ])/g);

    for (const token of tokens) {
      const word = { string: token, attributedStrings: [] };
      const parts = engines.wordHyphenation.hyphenateWord(token);

      for (const part of parts) {
        const start = paragraph.string.indexOf(part, index);
        word.attributedStrings.push(paragraph.slice(start, start + part.length));
        index += part.length;
      }

      wrappedParagraph.push(word);
    }

    wrappedParagraphs.push(wrappedParagraph);
  }

  return wrappedParagraphs;
};

export default class LayoutEngine {
  constructor(engines) {
    this.engines = injectEngines(engines);
    this.glyphGenerator = new GlyphGenerator(this.engines);
    this.typesetter = new Typesetter(this.engines);
  }

  layout(attributedString, containers) {
    const a1 = applyDefaultStyles(attributedString);
    const fontRuns = fontSubstitution(this.engines)(a1);
    const scriptRuns = scriptItemization(this.engines)(a1);
    const runs = flattenRuns([...a1.runs, ...fontRuns, ...scriptRuns]);
    const a3 = new AttributedString(a1.string, runs);
    const a4 = splitParagraphs(this.engines)(a3);
    const a5 = wrapWords(this.engines)(a4);
    console.log(a5);

    // const paragraphs = splitParagraphs()(attributedString);
    // const words = wrapWords(this.engines)(attributedString);
  }

  // layoutColumn(attributedString, start, container, rect, isLastContainer) {
  //   while (start < attributedString.length && rect.height > 0) {
  //     let next = attributedString.string.indexOf('\n', start);
  //     if (next === -1) next = attributedString.string.length;

  //     const paragraph = attributedString.slice(start, next);
  //     const block = this.layoutParagraph(paragraph, container, rect, start, isLastContainer);
  //     const paragraphHeight = block.bbox.height + block.style.paragraphSpacing;

  //     container.blocks.push(block);

  //     rect.y += paragraphHeight;
  //     rect.height -= paragraphHeight;
  //     start += paragraph.length + 1;

  //     // If entire paragraph did not fit, move on to the next column or container.
  //     if (start < next) break;
  //   }

  //   return start;
  // }

  // layoutParagraph(attributedString, container, rect, stringOffset, isLastContainer) {
  //   const glyphString = this.glyphGenerator.generateGlyphs(attributedString);
  //   const paragraphStyle = new ParagraphStyle(attributedString.runs[0].attributes);
  //   const { marginLeft, marginRight, indent, maxLines, lineSpacing } = paragraphStyle;

  //   const lineRect = new Rect(
  //     rect.x + marginLeft + indent,
  //     rect.y,
  //     rect.width - marginLeft - indent - marginRight,
  //     glyphString.height
  //   );

  //   let pos = 0;
  //   let lines = 0;
  //   let firstLine = true;
  //   const fragments = [];

  //   while (lineRect.y < rect.maxY && pos < glyphString.length && lines < maxLines) {
  //     const lineFragments = this.typesetter.layoutLineFragments(
  //       pos,
  //       lineRect,
  //       glyphString,
  //       container,
  //       paragraphStyle,
  //       stringOffset
  //     );

  //     lineRect.y += lineRect.height + lineSpacing;

  //     if (lineFragments.length > 0) {
  //       fragments.push(...lineFragments);
  //       pos = lineFragments[lineFragments.length - 1].end;
  //       lines++;

  //       if (firstLine) {
  //         lineRect.x -= indent;
  //         lineRect.width += indent;
  //         firstLine = false;
  //       }
  //     }
  //   }

  //   // Add empty line fragment for empty glyph strings
  //   if (glyphString.length === 0) {
  //     const newLineFragment = this.typesetter.layoutLineFragments(
  //       pos,
  //       lineRect,
  //       glyphString,
  //       container,
  //       paragraphStyle
  //     );

  //     fragments.push(...newLineFragment);
  //   }

  //   const isTruncated = isLastContainer && pos < glyphString.length;
  //   fragments.forEach((fragment, i) => {
  //     const isLastFragment = i === fragments.length - 1 && pos === glyphString.length;

  //     this.typesetter.finalizeLineFragment(fragment, paragraphStyle, isLastFragment, isTruncated);
  //   });

  //   return new Block(fragments, paragraphStyle);
  // }
}
