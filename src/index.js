import layoutEngine from './core/layoutEngine';
import lineBreaker from './engines/lineBreaker';
import justification from './engines/justification';
import textDecoration from './engines/textDecoration';
import scriptItemizer from './engines/scriptItemizer';
import wordHyphenation from './engines/wordHyphenation';
import fontSubstitution from './engines/fontSubstitution';

const engines = {
  lineBreaker,
  justification,
  textDecoration,
  scriptItemizer,
  wordHyphenation,
  fontSubstitution
};

const engine = layoutEngine(engines);

export default engine;
