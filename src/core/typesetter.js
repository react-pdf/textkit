import * as R from 'ramda';

import copyRect from '../rect/copy';
import cropRect from '../rect/crop';
import blockHeight from '../block/height';
import layoutParagraph from './layoutParagraph';

const applyContainerDefault = R.applySpec({
  path: R.prop('path'),
  blocks: R.propOr([], 'blocks'),
  columns: R.propOr(1, 'columns'),
  columnGap: R.propOr(18, 'columnGap') // 1/4 inch
});

const typesetter = engines => containers => attributedStrings => {
  const paragraphs = [...attributedStrings];

  const layoutContainer = container => {
    const blocks = [];

    let paragraphRect = copyRect(container.path);
    let nextParagraph = paragraphs.shift();

    while (nextParagraph) {
      const block = layoutParagraph(engines)(paragraphRect, nextParagraph);
      const linesHeight = blockHeight(block);

      if (paragraphRect.height >= linesHeight) {
        blocks.push(block);
        paragraphRect = cropRect(linesHeight, paragraphRect);
        nextParagraph = paragraphs.shift();
      } else {
        paragraphs.unshift(nextParagraph);
        break;
      }
    }

    return blocks;
  };

  return R.compose(
    R.flatten,
    R.map(R.o(layoutContainer, applyContainerDefault))
  )(containers);
};

export default typesetter;
