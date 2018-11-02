import flattenRuns from './flattenRuns';
import injectEngines from './injectEngines';
import Rect from '../geom/Rect';
import Block from '../models/Block';
import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';
import LineFragment from '../models/LineFragment';
import ParagraphStyle from '../models/ParagraphStyle';
import AttributedString from '../models/AttributedString';

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
  console.time('applyDefaultStyles');
  const runs = attributedString.runs.map(({ start, end, attributes }) => ({
    start,
    end,
    attributes: {
      color: attributes.color || 'black',
      backgroundColor: attributes.backgroundColor || null,
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

  const result = new AttributedString(attributedString.string, runs);

  console.timeEnd('applyDefaultStyles');
  return result;
};

const preprocessRuns = engines => attributedString => {
  const fontRuns = fontSubstitution(engines)(attributedString);
  const scriptRuns = scriptItemization(engines)(attributedString);
  const stringRuns = attributedString.runs.map(run => {
    const {
      attributes: { font, ...attributes }
    } = run;
    return { ...run, attributes };
  });

  console.time('flattenRuns');
  const runs = flattenRuns([...stringRuns, ...fontRuns, ...scriptRuns]);
  const result = new AttributedString(attributedString.string, runs);
  console.timeEnd('flattenRuns');
  return result;
};

const fontSubstitution = engines => attributedString => {
  console.time('fontSubstitution');
  const { string, runs } = attributedString;
  const result = engines.fontSubstitutionEngine.getRuns(string, runs);
  console.timeEnd('fontSubstitution');
  return result;
};

const scriptItemization = engines => attributedString => {
  console.time('scriptItemization');
  const result = engines.scriptItemizer.getRuns(attributedString.string);
  console.timeEnd('scriptItemization');

  return result;
};

const splitParagraphs = () => attributedString => {
  console.time('splitParagraphs');
  const res = [];

  let start = 0;
  let breakPoint = attributedString.string.indexOf('\n') + 1;

  while (breakPoint > 0) {
    res.push(attributedString.slice(start, breakPoint));
    start = breakPoint;
    breakPoint = attributedString.string.indexOf('\n', breakPoint) + 1;
  }

  if (start < attributedString.length) {
    res.push(attributedString.slice(start, attributedString.length));
  }

  console.timeEnd('splitParagraphs');

  return res;
};

const wrapWords = engines => attributedString => {
  console.time('wrapWords');
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

  const result = { attributedString: AttributedString.fromFragments(fragments), syllables };
  console.timeEnd('wrapWords');
  return result;
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
      attributes,
      glyphRun.glyphs,
      glyphRun.positions,
      glyphRun.stringIndices,
      glyphIndices
    );

    glyphIndex = glyphEnd;
    return res;
  });

  const result = new GlyphString(attributedString.string, glyphRuns);
  console.timeEnd('stringToGlyphs');
  return result;
};

const generateGlyphs = () => paragraph => {
  console.time('generateGlyphs');

  const result = {
    syllables: paragraph.syllables,
    value: stringToGlyphs(paragraph.attributedString)
  };

  console.timeEnd('generateGlyphs');
  return result;
};

const resolveAttachments = () => paragraph => {
  console.time('resolveAttachments');
  for (const glyphRun of paragraph.value.glyphRuns) {
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

  console.timeEnd('resolveAttachments');

  return paragraph;
};

const resolveYOffset = () => paragraph => {
  console.time('resolveYOffset');
  for (const glyphRun of paragraph.value.glyphRuns) {
    const { font, yOffset } = glyphRun.attributes;
    if (!yOffset) continue;
    for (let i = 0; i < glyphRun.length; i++) {
      glyphRun.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }

  console.timeEnd('resolveYOffset');
  return paragraph;
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

  console.time('linebreaking');
  const lines = engines.lineBreaker.suggestLineBreak(value, syllables, container.width, style);
  console.timeEnd('linebreaking');

  let currentY = container.y;
  const lineFragments = lines.map(string => {
    const lineBox = container.copy();
    const lineHeight = Math.max(string.height, style.lineHeight);

    lineBox.y = currentY;
    lineBox.height = lineHeight;
    currentY += lineHeight;

    return new LineFragment(lineBox, string);
  });

  // lineFragments.forEach((lineFragment, i) => {
  //   finalizeLineFragment(engines)(lineFragment, style, i === lineFragments.length - 1);
  // });

  return new Block(lineFragments);
};

const typesetter = engines => containers => glyphStrings => {
  const paragraphs = [...glyphStrings];

  const layoutColumn = container => column => {
    let paragraphRect = column.copy();
    let nextParagraph = paragraphs.shift();

    while (nextParagraph) {
      const block = layoutParagraph(engines)(nextParagraph, paragraphRect);
      // container.blocks.push(block);
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
    // let iteration = 10;

    // while (iteration > 0) {
    // console.time('layout');
    compose(
      typesetter(this.engines)(containers),
      map(resolveYOffset(this.engines)),
      map(resolveAttachments(this.engines)),
      map(generateGlyphs(this.engines)),
      map(wrapWords(this.engines)),
      splitParagraphs(this.engines),
      preprocessRuns(this.engines),
      applyDefaultStyles(this.engines)
    )(attributedString);
    // console.timeEnd('layout');
    //   iteration--;
    // }
  }
}
