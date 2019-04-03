import layoutEngine from './src';
import font from './tests/internal/font';

const string = {
  string: 'Lorem ipsum dolor fit amet',
  runs: [
    {
      start: 0,
      end: 6,
      attributes: {
        font,
        fontSize: 10
      }
    },
    {
      start: 6,
      end: 12,
      attributes: {
        font,
        fontSize: 12
      }
    },
    {
      start: 12,
      end: 18,
      attributes: {
        font,
        color: 'red',
        fontSize: 16
      }
    },
    {
      start: 18,
      end: 26,
      attributes: {
        font,
        color: 'green',
        fontSize: 18
      }
    }
  ]
};

const hrstart = process.hrtime();

const layout = layoutEngine(string, null);

const hrend = process.hrtime(hrstart);

console.log(layout[0]);

console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
