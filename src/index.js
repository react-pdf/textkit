import layoutEngine from './core/layoutEngine';
import fontSubstitution from './engines/fontSubstitution';
import scriptItemizer from './engines/scriptItemizer';
import wordHyphenation from './engines/wordHyphenation';
import lineBreaker from './engines/lineBreaker';

const engines = {
  lineBreaker,
  scriptItemizer,
  wordHyphenation,
  fontSubstitutionEngine: fontSubstitution
};

const engine = layoutEngine(engines);

export default engine;
