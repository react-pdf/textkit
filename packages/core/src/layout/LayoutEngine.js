import flattenRuns from './flattenRuns';
import injectEngines from './injectEngines';
import Rect from '../geom/Rect';
import Block from '../models/Block';
import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';
import LineFragment from '../models/LineFragment';
import ParagraphStyle from '../models/ParagraphStyle';
import AttributedString from '../models/AttributedString';
import FontDescriptor from '../models/FontDescriptor';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */

const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

const map = fn => (array, ...other) => array.map((e, index) => fn(e, ...other, index));

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
  const stringRuns = attributedString.runs.map(run => {
    const {
      attributes: { font, fontDescriptor, ...attributes }
    } = run;
    return { ...run, attributes };
  });

  const runs = flattenRuns([...stringRuns, ...fontRuns, ...scriptRuns]);
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
  const syllables = [];
  const fragments = [];

  for (const run of attributedString.runs) {
    let string = '';
    const tokens = attributedString.string
      .slice(run.start, run.end)
      .split(/([ ]+)/g)
      .filter(Boolean);

    for (const token of tokens) {
      const parts = engines.wordHyphenation.hyphenateWord(token);
      syllables.push(...parts);
      string += parts.join('');
    }

    fragments.push({ string, attributes: run.attributes });
  }

  return { attributedString: AttributedString.fromFragments(fragments), syllables };
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

const stringToGlyphs = attributedString => {
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

    glyphIndex = glyphEnd;
    return res;
  });

  return new GlyphString(attributedString.string, glyphRuns);
};

const generateGlyphs = () => paragraph => {
  let start = 0;
  const syllables = paragraph.syllables.map(syllable => {
    const syllableString = paragraph.attributedString.slice(start, start + syllable.length);
    start += syllable.length;
    return stringToGlyphs(syllableString);
  });

  return { syllables, value: stringToGlyphs(paragraph.attributedString) };
};

const resolveAttachments = () => glyphString => {
  for (const glyphRun of glyphString.glyphRuns) {
    const { font, attachment } = glyphRun.attributes;
    if (!attachment) continue;
    const objectReplacement = font.glyphForCodePoint(0xfffc);
    for (let i = 0; i < glyphRun.length; i++) {
      const glyph = glyphRun.glyphs[i];
      const position = glyphRun.positions[i];
      if (glyph === objectReplacement) {
        position.xAdvance = attachment.width;
      }
    }
  }

  return glyphString;
};

const resolveYOffset = () => glyphString => {
  for (const glyphRun of glyphString.glyphRuns) {
    const { font, yOffset } = glyphRun.attributes;
    if (!yOffset) continue;
    for (let i = 0; i < glyphRun.length; i++) {
      glyphRun.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }

  return glyphString;
};

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

const finalizeLineFragment = engines => (line, style, isLastFragment, isTruncated) => {
  const align = isLastFragment && !isTruncated ? style.alignLastLine : style.align;

  if (isLastFragment && isTruncated && style.truncationMode) {
    engines.truncationEngine.truncate(line, style.truncationMode);
  }

  let start = 0;
  let end = line.length;

  // Ignore whitespace at the start and end of a line for alignment
  while (line.isWhiteSpace(start)) {
    line.overflowLeft += line.getGlyphWidth(start++);
  }

  while (line.isWhiteSpace(end - 1)) {
    line.overflowRight += line.getGlyphWidth(--end);
  }

  // Adjust line rect for hanging punctuation
  if (style.hangingPunctuation) {
    if (align === 'left' || align === 'justify') {
      if (line.isHangingPunctuationStart(start)) {
        line.overflowLeft += line.getGlyphWidth(start++);
      }
    }

    if (align === 'right' || align === 'justify') {
      if (line.isHangingPunctuationEnd(end - 1)) {
        line.overflowRight += line.getGlyphWidth(--end);
      }
    }
  }

  line.rect.x -= line.overflowLeft;
  line.rect.width += line.overflowLeft + line.overflowRight;

  // Adjust line offset for alignment
  const remainingWidth = line.rect.width - line.advanceWidth;
  line.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];

  if (align === 'justify' || line.advanceWidth > line.rect.width) {
    engines.justificationEngine.justify(line, {
      factor: style.justificationFactor
    });
  }

  engines.decorationEngine.createDecorationLines(line);
};

const layoutParagraph = engines => (paragraph, container) => {
  const { value, syllables } = paragraph;
  const style = new ParagraphStyle();
  const lines = engines.lineBreaker.suggestLineBreak(value, syllables, container.width, style);

  let currentY = container.y;
  const lineFragments = lines.map(string => {
    const lineBox = container.copy();
    const lineHeight = Math.max(string.height, style.lineHeight);

    lineBox.y = currentY;
    lineBox.height = lineHeight;
    currentY += lineHeight;

    return new LineFragment(lineBox, string);
  });

  lineFragments.forEach((lineFragment, i) => {
    finalizeLineFragment(engines)(lineFragment, style, i === lineFragments.length - 1);
  });

  return new Block(lineFragments);
};

const typesetter = engines => containers => glyphStrings => {
  console.log(glyphStrings);

  const paragraphs = [...glyphStrings];

  const layoutColumn = container => column => {
    let paragraphRect = column.copy();
    let nextParagraph = paragraphs.shift();

    while (nextParagraph) {
      const block = layoutParagraph(engines)(nextParagraph, paragraphRect);
      container.blocks.push(block);
      paragraphRect = paragraphRect.copy();
      paragraphRect.y += block.height;
      paragraphRect.height -= block.height;
      nextParagraph = paragraphs.shift();
    }
  };

  const layoutContainer = container => {
    compose(
      map(layoutColumn(container)),
      resolveColumns
    )(container);
  };

  return containers.map(layoutContainer);
};

export default class LayoutEngine {
  constructor(engines) {
    this.engines = injectEngines(engines);
  }

  layout(attributedString, containers) {
    console.time('layout');
    compose(
      typesetter(this.engines)(containers),
      // map(resolveYOffset(this.engines)),
      // map(resolveAttachments(this.engines)),
      map(generateGlyphs(this.engines)),
      map(wrapWords(this.engines)),
      splitParagraphs(this.engines),
      preprocessRuns(this.engines),
      applyDefaultStyles(this.engines)
    )(attributedString);
    console.timeEnd('layout');
  }
}
