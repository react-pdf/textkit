import layoutEngine from './core/layoutEngine';
import lineBreaker from './engines/lineBreaker';
import justification from './engines/justification';
import scriptItemizer from './engines/scriptItemizer';
import wordHyphenation from './engines/wordHyphenation';
import fontSubstitution from './engines/fontSubstitution';

const engines = {
  lineBreaker,
  justification,
  scriptItemizer,
  wordHyphenation,
  fontSubstitutionEngine: fontSubstitution
};

const engine = layoutEngine(engines);

export default engine;
