import fs from 'fs';
import PDFDocument from '@react-pdf/pdfkit';
import fontkit from '@react-pdf/fontkit';
import layoutEngine from './src';
import PDFRenderer from './src/PDFRenderer';
import fromFragments from './src/attributedString/fromFragments';

const font = fontkit.openSync(`${__dirname}/font.ttf`);

const string = fromFragments([
  {
    string:
      'Nulla amet veniam tempor aute laborum.\nConsectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud.',
    attributes: {
      font,
      fontSize: 16
    }
  }
]);

// Create a document
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));

const hrstart = process.hrtime();

const container = { x: 20, y: 50, width: 150, height: 700 };

const layout = layoutEngine(string, container);

// console.log(layout);
const hrend = process.hrtime(hrstart);
console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

PDFRenderer.render(doc, layout, { outlineRuns: true });

doc.end();
