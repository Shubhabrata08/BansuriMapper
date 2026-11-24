import type { SwaraKey } from './mapper';

export type RagaDefinition = {
  name: string;
  thaat: string;
  notes: readonly SwaraKey[];
  source: string;
  additionalSources?: readonly string[];
  variantNote?: string;
};

const hri = (slug: string) => `https://ragajunglism.org/ragas/${slug}/`;
const tanarang = (slug: string) => `https://tanarang.com/raag-${slug}/`;
const notes = (...keys: SwaraKey[]): readonly SwaraKey[] => [...keys, "S'"];

// Names and family assignments follow the requested catalog. These are documented
// note inventories, not aroha/avaroha, ornamentation, or every gharana variant.
const definitions = [
  { name: 'Alhaiya Bilawal', thaat: 'Bilawal', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n', 'N'), source: hri('alhaiya-bilawal') },
  { name: 'Bilawal', thaat: 'Bilawal', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'N'), source: hri('bilawal') },
  { name: 'Yamani Bilawal', thaat: 'Bilawal', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('yamani-bilawal'), variantNote: 'Both Ma forms are included. The very rare komal Ni used in some renderings is not included in this reference.' },

  { name: 'Yaman', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M#', 'P', 'D', 'N'), source: hri('yaman') },
  { name: 'Yaman Kalyan', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: hri('yaman-kalyan') },
  { name: 'Shuddh Kalyan', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M#', 'P', 'D', 'N'), source: tanarang('shuddha-kalyan'), variantNote: 'The inventory includes tivra Ma and Ni from descending movement; the ascent omits them.' },
  { name: 'Shyam Kalyan', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('shyam-kalyan') },
  { name: 'Bhoopali', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'P', 'D'), source: hri('bhupali') },
  { name: 'Bihag', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('bihag') },
  { name: 'Kedar', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('kedar'), variantNote: 'Ga is commonly a touch note. Some renderings also use a rare komal Ni, which is not included in this reference.' },
  { name: 'Hamir', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: hri('hameer') },
  { name: 'Chhayanat', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: hri('chayanat') },
  { name: 'Hindol', thaat: 'Kalyan', notes: notes('S', 'G', 'M#', 'D', 'N'), source: hri('hindol') },
  { name: 'Nand', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('nand') },
  { name: 'Maru Bihag', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('maru-bihag'), variantNote: 'Tivra Ma is prominent; shuddha Ma is included for its occasional use.' },
  { name: 'Shuddh Sarang', thaat: 'Kalyan', notes: notes('S', 'R', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('shuddha-sarang') },
  { name: 'Gaud Sarang', thaat: 'Kalyan', notes: notes('S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N'), source: hri('gaud-sarang') },

  { name: 'Khamaj', thaat: 'Khamaj', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n', 'N'), source: tanarang('khamaj'), variantNote: 'Both Ni forms are used: shuddha Ni in ascent and komal Ni in descent.' },
  { name: 'Desh', thaat: 'Khamaj', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n', 'N'), source: hri('desh') },
  { name: 'Tilak Kamod', thaat: 'Khamaj', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n', 'N'), source: tanarang('tilak-kamod'), variantNote: 'Komal Ni is included for its rare descending use.' },
  { name: 'Tilang', thaat: 'Khamaj', notes: notes('S', 'G', 'M', 'P', 'n', 'N'), source: hri('tilang') },
  { name: 'Jaijaiwanti', thaat: 'Khamaj', notes: notes('S', 'R', 'g', 'G', 'M', 'P', 'D', 'n', 'N'), source: hri('jaijaiwanti') },
  { name: 'Jhinjhoti', thaat: 'Khamaj', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n'), source: hri('jhinjhoti') },
  { name: 'Kalavati', thaat: 'Khamaj', notes: notes('S', 'G', 'P', 'D', 'n'), source: hri('kalavati') },
  { name: 'Rageshri', thaat: 'Khamaj', notes: notes('S', 'R', 'G', 'M', 'D', 'n'), source: tanarang('rageshree') },
  { name: 'Bhinna Shadja', thaat: 'Khamaj', notes: notes('S', 'G', 'M', 'D', 'N'), source: hri('bhinna-shadja') },
  { name: 'Gara', thaat: 'Khamaj', notes: notes('S', 'R', 'g', 'G', 'M', 'P', 'D', 'n', 'N'), source: hri('gara') },
  { name: 'Gorakh Kalyan', thaat: 'Khamaj', notes: notes('S', 'R', 'M', 'D', 'n'), source: tanarang('gorakh-kalyan'), additionalSources: [hri('gorakh-kalyan')], variantNote: 'This reference uses the Pa-omitting form; other traditions may include Pa.' },

  { name: 'Bhairav', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'M', 'P', 'd', 'N'), source: hri('bhairav') },
  { name: 'Ahir Bhairav', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'M', 'P', 'D', 'n'), source: hri('ahir-bhairav') },
  { name: 'Bairagi Bhairav', thaat: 'Bhairav', notes: notes('S', 'r', 'M', 'P', 'n'), source: hri('bairagi') },
  { name: 'Nat Bhairav', thaat: 'Bhairav', notes: notes('S', 'R', 'G', 'M', 'P', 'd', 'N'), source: hri('nat-bhairav') },
  { name: 'Bhatiyar', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'M', 'M#', 'P', 'D', 'N'), source: tanarang('bhatiyar') },
  { name: 'Jogiya', thaat: 'Bhairav', notes: notes('S', 'r', 'M', 'P', 'd', 'N'), source: tanarang('jogiya') },
  { name: 'Gunakri', thaat: 'Bhairav', notes: notes('S', 'r', 'M', 'P', 'd'), source: hri('gunakri') },
  { name: 'Vibhas', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'P', 'd'), source: hri('bibhas') },
  { name: 'Bhankar', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'M', 'M#', 'P', 'd', 'D', 'N'), source: hri('bhankar'), variantNote: 'This inventory follows a Jaipur-Atrauli form with both Ma and Dha variants; other gharanas differ.' },
  { name: 'Ramkali', thaat: 'Bhairav', notes: notes('S', 'r', 'G', 'M', 'M#', 'P', 'd', 'n', 'N'), source: tanarang('ramkali') },

  { name: 'Poorvi', thaat: 'Poorvi', notes: notes('S', 'r', 'G', 'M', 'M#', 'P', 'd', 'N'), source: tanarang('poorvi') },
  { name: 'Puriya Dhanashree', thaat: 'Poorvi', notes: notes('S', 'r', 'G', 'M#', 'P', 'd', 'N'), source: hri('puriya-dhanashree') },
  { name: 'Shree', thaat: 'Poorvi', notes: notes('S', 'r', 'G', 'M#', 'P', 'd', 'N'), source: hri('shree') },
  { name: 'Basant', thaat: 'Poorvi', notes: notes('S', 'r', 'G', 'M#', 'P', 'd', 'N'), source: hri('basant'), variantNote: 'The main tivra-Ma inventory is shown; some interpretations also color phrases with shuddha Ma.' },
  { name: 'Lalit', thaat: 'Poorvi', notes: notes('S', 'r', 'G', 'M', 'M#', 'd', 'N'), source: hri('lalit'), variantNote: 'This is the komal-Dha form; shuddha-Dha interpretations also exist.' },

  { name: 'Marwa', thaat: 'Marwa', notes: notes('S', 'r', 'G', 'M#', 'D', 'N'), source: hri('marwa') },
  { name: 'Puriya', thaat: 'Marwa', notes: notes('S', 'r', 'G', 'M#', 'D', 'N'), source: hri('puriya') },
  { name: 'Sohni', thaat: 'Marwa', notes: notes('S', 'r', 'G', 'M#', 'D', 'N'), source: hri('sohini') },

  { name: 'Kafi', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'M', 'P', 'D', 'n'), source: hri('kafi') },
  { name: 'Bhimpalasi', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'M', 'P', 'D', 'n'), source: hri('bhimpalasi') },
  { name: 'Bageshri', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'M', 'P', 'D', 'n'), source: tanarang('bageshree') },
  { name: 'Bahar', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'M', 'P', 'D', 'n', 'N'), source: hri('bahar') },
  { name: 'Brindavani Sarang', thaat: 'Kafi', notes: notes('S', 'R', 'M', 'P', 'n', 'N'), source: hri('sarang') },
  { name: 'Madhyamad Sarang', thaat: 'Kafi', notes: notes('S', 'R', 'M', 'P', 'n'), source: hri('madhumad-sarang') },
  { name: 'Piloo', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'G', 'M', 'P', 'd', 'D', 'n', 'N'), source: hri('pilu'), variantNote: 'A common mixed Ga, Dha and Ni inventory is shown; light-classical variants are especially flexible.' },
  { name: 'Shivranjani', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'P', 'D'), source: hri('shivranjani') },
  { name: 'Dhani', thaat: 'Kafi', notes: notes('S', 'g', 'M', 'P', 'n'), source: hri('dhani') },
  { name: 'Malgunji', thaat: 'Kafi', notes: notes('S', 'R', 'g', 'G', 'M', 'P', 'D', 'n', 'N'), source: tanarang('malgunji') },
  { name: 'Gaud Malhar', thaat: 'Kafi', notes: notes('S', 'R', 'G', 'M', 'P', 'D', 'n', 'N'), source: tanarang('gaud-malhar') },

  { name: 'Asavari', thaat: 'Asavari', notes: notes('S', 'R', 'g', 'M', 'P', 'd', 'n'), source: hri('asavari'), variantNote: 'The shuddha-Re form is shown. Komal-Re and mixed-Re Asavari are separate interpretations, not combined here.' },
  { name: 'Jaunpuri', thaat: 'Asavari', notes: notes('S', 'R', 'g', 'M', 'P', 'd', 'n'), source: hri('jaunpuri') },
  { name: 'Darbari Kanada', thaat: 'Asavari', notes: notes('S', 'R', 'g', 'M', 'P', 'd', 'n'), source: hri('darbari') },
  { name: 'Adana', thaat: 'Asavari', notes: notes('S', 'R', 'g', 'M', 'P', 'd', 'n'), source: hri('adana') },
  { name: 'Desi', thaat: 'Asavari', notes: notes('S', 'R', 'g', 'M', 'P', 'D', 'n'), source: tanarang('desi'), additionalSources: [hri('desi')], variantNote: 'This reference uses shuddha Dha; komal-Dha and mixed-Dha Desi variants also exist.' },

  { name: 'Bhairavi', thaat: 'Bhairavi', notes: notes('S', 'r', 'g', 'M', 'P', 'd', 'n'), source: hri('bhairavi') },
  { name: 'Malkauns', thaat: 'Bhairavi', notes: notes('S', 'g', 'M', 'd', 'n'), source: hri('malkauns') },
  { name: 'Bhupal Todi', thaat: 'Bhairavi', notes: notes('S', 'r', 'g', 'P', 'd'), source: hri('bhupali-todi') },
  { name: 'Bilaskhani Todi', thaat: 'Bhairavi', notes: notes('S', 'r', 'g', 'M', 'P', 'd', 'n'), source: hri('bilaskhani-todi') },
] as const satisfies readonly RagaDefinition[];

export type RagaName = typeof definitions[number]['name'];
export const ragas: readonly RagaDefinition[] = [...definitions].sort((a, b) => a.name.localeCompare(b.name, 'en'));
export const ragaOptions = ragas.map(raga => ({ value: raga.name, label: raga.name }));

export function getRaga(name: string): RagaDefinition | undefined {
  return ragas.find(raga => raga.name === name);
}
