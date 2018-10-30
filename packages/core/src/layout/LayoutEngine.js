import flattenRuns from './flattenRuns';
import injectEngines from './injectEngines';
import Rect from '../geom/Rect';
import Run from '../models/Run';
import Block from '../models/Block';
import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';
import LineFragment from '../models/LineFragment';
import AttributedString from '../models/AttributedString';
import FontDescriptor from '../models/FontDescriptor';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */

const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

const map = fn => array => array.map(fn);

const applyDefaultStyles = () => attributedString => {
  const runs = attributedString.runs.map(({ start, end, attributes }) => ({
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
  }));

  return new AttributedString(attributedString.string, runs);
};

const preprocessRuns = engines => attributedString => {
  const fontRuns = fontSubstitution(engines)(attributedString);
  const scriptRuns = scriptItemization(engines)(attributedString);

  // TODO: Avoid this
  attributedString.runs.forEach(run => {
    delete run.attributes.font;
    delete run.attributes.fontDescriptor;
  });

  const runs = flattenRuns([...attributedString.runs, ...fontRuns, ...scriptRuns]);
  return new AttributedString(attributedString.string, runs);
};

const fontSubstitution = engines => attributedString => {
  const { string, runs } = attributedString;
  return engines.fontSubstitutionEngine.getRuns(string, runs);
};

const scriptItemization = engines => attributedString => {
  const { string } = attributedString;
  return engines.scriptItemizer.getRuns(string);
};

const splitParagraphs = () => attributedString => {
  let index = 0;
  const paragraps = attributedString.string.split(/(.*\n{1})/g).filter(Boolean);

  return paragraps.map(string => {
    const paragraph = attributedString.slice(index, index + string.length);
    index += string.length;
    return paragraph;
  });
};

const wrapWords = engines => attributedString => {
  const fragments = [];

  for (const run of attributedString.runs) {
    let string = '';
    const tokens = attributedString.string.slice(run.start, run.end).split(/([ ])/g);

    for (const token of tokens) {
      const parts = engines.wordHyphenation.hyphenateWord(token);
      string += parts.join('');
    }

    fragments.push({ string, attributes: run.attributes });
  }

  return AttributedString.fromFragments(fragments);
};

const resolveGlyphIndices = (string, stringIndices) => {
  const glyphIndices = [];

  for (let i = 0; i < string.length; i++) {
    for (let j = 0; j < stringIndices.length; j++) {
      if (stringIndices[j] >= i) {
        glyphIndices[i] = j;
        break;
      }

      glyphIndices[i] = undefined;
    }
  }

  let lastValue = glyphIndices[glyphIndices.length - 1];
  for (let i = glyphIndices.length - 1; i >= 0; i--) {
    if (glyphIndices[i] === undefined) {
      glyphIndices[i] = lastValue;
    } else {
      lastValue = glyphIndices[i];
    }
  }

  lastValue = glyphIndices[0];
  for (let i = 0; i < glyphIndices.length; i++) {
    if (glyphIndices[i] === undefined) {
      glyphIndices[i] = lastValue;
    } else {
      lastValue = glyphIndices[i];
    }
  }

  return glyphIndices;
};

const generateGlyphs = () => attributedString => {
  let glyphIndex = 0;
  const glyphRuns = attributedString.runs.map(run => {
    const { start, end, attributes } = run;
    const str = attributedString.string.slice(start, end);
    const glyphRun = run.attributes.font.layout(str, attributes.features, attributes.script);
    const glyphEnd = glyphIndex + glyphRun.glyphs.length;
    const glyphIndices = resolveGlyphIndices(str, glyphRun.stringIndices);

    const res = new GlyphRun(
      glyphIndex,
      glyphEnd,
      run.attributes,
      glyphRun.glyphs,
      glyphRun.positions,
      glyphRun.stringIndices,
      glyphIndices
    );

    // this.resolveAttachments(res);
    // this.resolveYOffset(res);

    glyphIndex = glyphEnd;

    return res;
  });

  return new GlyphString(attributedString.string, glyphRuns);
};

// const resolveAttachments = () => paragraphs => {
//   for (const paragraph of paragraphs) {
//     for (const word of paragraph) {
//       // const { font, attachment } = glyphRun.attributes;
//       // if (!attachment) {
//       //   return;
//       // }
//       // const objectReplacement = font.glyphForCodePoint(0xfffc);
//       // for (let i = 0; i < glyphRun.length; i++) {
//       //   const glyph = glyphRun.glyphs[i];
//       //   const position = glyphRun.positions[i];
//       //   if (glyph === objectReplacement) {
//       //     position.xAdvance = attachment.width;
//       //   }
//       // }
//     }
//   }

//   return paragraphs;
// };

const resolveColumns = container => {
  const { bbox, columns, columnGap } = container;
  const columnWidth = (bbox.width - columnGap * (columns - 1)) / columns;

  let x = bbox.minX;
  const result = [];

  for (let index = 0; index < columns; index++) {
    result.push(new Rect(x, bbox.minY, columnWidth, bbox.height));
    x += columnWidth + container.columnGap;
  }

  return result;
};

const layoutLineFragments = (paragraph, container) => {
  const xAdvance = 0;

  for (const word of paragraph) {
    for (const glyphString of word.glyphStrings) {
    }
  }

  return [];
};

const glyphGenerator = engines => attributedString =>
  compose(
    // resolveAttachments(this.engines),
    map(generateGlyphs(engines)),
    map(wrapWords(engines)),
    splitParagraphs(engines),
    preprocessRuns(engines),
    applyDefaultStyles(engines)
  )(attributedString);

export default class LayoutEngine {
  constructor(engines) {
    this.engines = injectEngines(engines);
  }

  layout(attributedString, containers) {
    let i = 10;

    while (i > 0) {
      console.time('layout');
      const paragraphs = glyphGenerator(this.engines)(attributedString);
      // console.log(paragraphs);
      console.timeEnd('layout');
      i--;
    }

    // for (const container of containers) {
    //   const columns = resolveColumns(container);

    //   for (const paragraph of paragraphs) {
    //     const lines = layoutLineFragments(paragraph, columns[0]);

    //     container.blocks.push(new Block(lines));
    //   }
    // }

    // return paragraphs;
  }
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
