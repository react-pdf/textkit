/**
 * Apply default style to run
 *
 * @param  {Object}  rect to be splitted
 * @param  {number}  line height
 * @return {Array} line fragments (rects) with given height
 */
const generateFragments = (rect, lineHeight) => {
  const lineFragements = [];

  if (!rect) return [];

  let yCount = rect.y;

  while (rect.height + rect.y >= yCount + lineHeight) {
    lineFragements.push({
      x: rect.x,
      y: yCount,
      width: rect.width,
      height: lineHeight
    });
    yCount += lineHeight;
  }

  return lineFragements;
};

export default generateFragments;
