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
      'Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt.\nConsectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat.\nNulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt.\nConsectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat.\nNulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt.\nConsectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat.\nNulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt. Nulla amet veniam tempor aute laborum. Dolor non irure dolore veniam eiusmod Lorem incididunt. Do adipisicing ad laborum elit ex velit minim sint ipsum ad do. Velit ut exercitation pariatur aliqua aute ex cillum excepteur cillum consequat mollit sunt.\nConsectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat. Consectetur incididunt laboris cupidatat officia sit mollit sit in cillum nostrud. Occaecat laborum aliqua sint id Lorem et velit commodo nostrud nostrud amet veniam. Non cupidatat in officia elit sunt labore aute pariatur occaecat.',
    attributes: {
      font,
      fontSize: 8,
      align: 'center'
    }
  }
]);

// Create a document
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(`${__dirname}/output.pdf`));

const hrstart = process.hrtime();

const container = { x: 20, y: 50, width: 570, height: 700 };

const layout = layoutEngine(string, container);

// console.log(layout);
const hrend = process.hrtime(hrstart);
console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);

PDFRenderer.render(doc, layout);

doc.end();
