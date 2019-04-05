import runHeight from '../run/height';
import runDescent from '../run/descent';
import advanceWidth from '../run/advanceWidth';
import ascent from '../attributedString/ascent';

const renderAttachments = (ctx, run) => {
  ctx.save();

  const { font } = run.attributes;
  const space = font.glyphForCodePoint(0x20);
  const objectReplacement = font.glyphForCodePoint(0xfffc);

  for (let i = 0; i < run.glyphs.length; i++) {
    const position = run.positions[i];
    const glyph = run.glyphs[i];

    ctx.translate(position.xAdvance, position.yOffset | 0);

    if (glyph.id === objectReplacement.id && run.attributes.attachment) {
      renderAttachment(ctx, run.attributes.attachment);
      run.glyphs[i] = space;
    }
  }

  ctx.restore();
};

const renderAttachment = (ctx, attachment) => {
  const { xOffset = 0, yOffset = 0, width, height, image } = attachment;

  ctx.translate(-width + xOffset, -height + yOffset);

  ctx.image(image, 0, 0, {
    fit: [width, height],
    align: 'center',
    valign: 'bottom'
  });
};

const renderRun = (ctx, run, options) => {
  const { font, fontSize, color, link, opacity } = run.attributes;

  const height = runHeight(run);
  const descent = runDescent(run);
  const runAdvanceWidth = advanceWidth(run);

  if (options.outlineRuns) {
    ctx.rect(0, -height, runAdvanceWidth, height).stroke();
  }

  ctx.fillColor(color);
  ctx.fillOpacity(opacity);

  if (link) {
    ctx.link(0, -height - descent, runAdvanceWidth, height, link);
  }

  renderAttachments(ctx, run);

  if (font.sbix || (font.COLR && font.CPAL)) {
    ctx.save();
    ctx.translate(0, -run.ascent);

    for (let i = 0; i < run.glyphs.length; i++) {
      const position = run.positions[i];
      const glyph = run.glyphs[i];

      ctx.save();
      ctx.translate(position.xOffset, position.yOffset);

      glyph.render(ctx, fontSize);

      ctx.restore();
      ctx.translate(position.xAdvance, position.yAdvance);
    }

    ctx.restore();
  } else {
    ctx.font(typeof font.name === 'string' ? font.name : font, fontSize);
    ctx._addGlyphs(run.glyphs, run.positions, 0, 0);
  }

  ctx.translate(runAdvanceWidth, 0);
};

const renderLine = (ctx, line, options) => {
  const lineAscent = ascent(line);

  if (options.outlineLines) {
    ctx.rect(line.box.x, line.box.y, line.box.width, line.box.height).stroke();
  }

  ctx.save();
  ctx.translate(line.box.x, line.box.y + lineAscent);

  for (const run of line.runs) {
    // if (run.attributes.backgroundColor) {
    //   const backgroundRect = new Rect(0, -line.ascent, run.advanceWidth, line.rect.height);
    //   this.renderBackground(backgroundRect, run.attributes.backgroundColor);
    // }
    renderRun(ctx, run, options);
  }

  ctx.restore();
  ctx.save();
  ctx.translate(line.box.x, line.box.y);

  // for (const decorationLine of line.decorationLines) {
  //   this.renderDecorationLine(decorationLine);
  // }

  ctx.restore();
};

const renderBlock = (ctx, block, options) => {
  for (const line of block) {
    renderLine(ctx, line, options);
  }
};

const render = (ctx, blocks, options = {}) => {
  for (const block of blocks) {
    renderBlock(ctx, block, options);
  }
};

export default { render };

// renderBackground(rect, backgroundColor) {
//   this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
//   this.ctx.fill(backgroundColor);
// }

// renderDecorationLine(line) {
//   this.ctx.lineWidth(line.rect.height);

//   if (/dashed/.test(line.style)) {
//     this.ctx.dash(3 * line.rect.height);
//   } else if (/dotted/.test(line.style)) {
//     this.ctx.dash(line.rect.height);
//   }

//   if (/wavy/.test(line.style)) {
//     const dist = Math.max(2, line.rect.height);
//     let step = 1.1 * dist;
//     const stepCount = Math.floor(line.rect.width / (2 * step));

//     // Adjust step to fill entire width
//     const remainingWidth = line.rect.width - stepCount * 2 * step;
//     const adjustment = remainingWidth / stepCount / 2;
//     step += adjustment;

//     const cp1y = line.rect.y + dist;
//     const cp2y = line.rect.y - dist;
//     let { x } = line.rect;

//     this.ctx.moveTo(line.rect.x, line.rect.y);

//     for (let i = 0; i < stepCount; i++) {
//       this.ctx.bezierCurveTo(x + step, cp1y, x + step, cp2y, x + 2 * step, line.rect.y);
//       x += 2 * step;
//     }
//   } else {
//     this.ctx.moveTo(line.rect.x, line.rect.y);
//     this.ctx.lineTo(line.rect.maxX, line.rect.y);

//     if (/double/.test(line.style)) {
//       this.ctx.moveTo(line.rect.x, line.rect.y + line.rect.height * 2);
//       this.ctx.lineTo(line.rect.maxX, line.rect.y + line.rect.height * 2);
//     }
//   }

//   this.ctx.stroke(line.color);
// }
