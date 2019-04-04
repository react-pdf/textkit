import bestFit from '../lib/bestFit';
import linebreak from '../lib/linebreak';
import slice from '../attributedString/slice';
import stringEnd from '../attributedString/end';
import insertGlyph from '../attributedString/insertGlyph';
import advanceWidth from '../attributedString/advanceWidth';

const HYPHEN = 0x002d;
const TOLERANCE_STEPS = 5;
const TOLERANCE_LIMIT = 50;

const opts = {
  width: 3,
  stretch: 6,
  shrink: 9
};

const breakLines = (string, nodes, breaks) => {
  let start = 0;
  let end = null;

  const lines = breaks.reduce((acc, breakPoint) => {
    const node = nodes[breakPoint.position];
    const prevNode = nodes[breakPoint.position - 1];

    // Last breakpoint corresponds to K&P mandatory final glue
    if (breakPoint.position === nodes.length - 1) return acc;

    let line;
    if (node.type === 'penalty') {
      end = prevNode.value.end;
      line = slice(start, end, string);
      line = insertGlyph(line.length, HYPHEN, line);
    } else {
      end = node.value.end;
      line = slice(start, end, string);
    }

    start = end;
    return [...acc, line];
  }, []);

  // Last line
  lines.push(slice(start, string.string.length, string));

  return lines;
};

// TODO: parametrize penalty via options
const getNodes = (attributedString, { align }) => {
  let start = 0;

  const hyphenWidth = 5;
  const hyphenPenalty = align === 'justify' ? 100 : 600;
  const { syllables } = attributedString;

  const result = syllables.reduce((acc, s, index) => {
    const syllable = slice(start, start + s.length, attributedString);

    if (syllable.string.trim() === '') {
      const width = advanceWidth(syllable);
      const stretch = (width * opts.width) / opts.stretch;
      const shrink = (width * opts.width) / opts.shrink;
      const value = { value: syllable, start, end: start + stringEnd(syllable) };

      acc.push(linebreak.glue(width, value, stretch, shrink));
    } else {
      const hyphenated = syllables[index + 1] !== ' ';
      const value = { value: syllable, start, end: start + stringEnd(syllable) };
      acc.push(linebreak.box(advanceWidth(syllable), value, hyphenated));

      if (syllables[index + 1] && hyphenated) {
        acc.push(linebreak.penalty(hyphenWidth, hyphenPenalty, 1));
      }
    }

    start += s.length;

    return acc;
  }, []);

  result.push(linebreak.glue(0, null, linebreak.infinity, 0));
  result.push(linebreak.penalty(0, -linebreak.infinity, 1));

  return result;
};

const lineBreaker = (attributedString, availableWidths) => {
  let tolerance = 4; // TODO: Edit by options

  const style = attributedString.runs[0].attributes;

  const nodes = getNodes(attributedString, style);
  let breaks = linebreak(nodes, availableWidths, { tolerance });

  // Try again with a higher tolerance if the line breaking failed.
  while (breaks.length === 0 && tolerance < TOLERANCE_LIMIT) {
    tolerance += TOLERANCE_STEPS;
    breaks = linebreak(nodes, availableWidths, { tolerance });
  }

  if (breaks.length === 0 || (breaks.length === 1 && breaks[0].position === 0)) {
    breaks = bestFit(nodes, availableWidths);
  }

  return breakLines(attributedString, nodes, breaks.slice(1));
};

export default lineBreaker;
