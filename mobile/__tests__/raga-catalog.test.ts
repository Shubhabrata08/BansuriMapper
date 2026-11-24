import { getRaga, ragas, ragaOptions } from '../src/domain/raga-catalog.web';
import { initialRagaState, mapRaga, ragaReducer } from '../src/domain/raga-mapper.web';
import { swaras, type SwaraKey } from '../src/domain/mapper';

const requested = {
  Bilawal: ['Alhaiya Bilawal', 'Bilawal', 'Yamani Bilawal'],
  Kalyan: ['Yaman', 'Yaman Kalyan', 'Shuddh Kalyan', 'Shyam Kalyan', 'Bhoopali', 'Bihag', 'Kedar', 'Hamir', 'Chhayanat', 'Hindol', 'Nand', 'Maru Bihag', 'Shuddh Sarang', 'Gaud Sarang'],
  Khamaj: ['Khamaj', 'Desh', 'Tilak Kamod', 'Tilang', 'Jaijaiwanti', 'Jhinjhoti', 'Kalavati', 'Rageshri', 'Bhinna Shadja', 'Gara', 'Gorakh Kalyan'],
  Bhairav: ['Bhairav', 'Ahir Bhairav', 'Bairagi Bhairav', 'Nat Bhairav', 'Bhatiyar', 'Jogiya', 'Gunakri', 'Vibhas', 'Bhankar', 'Ramkali'],
  Poorvi: ['Poorvi', 'Puriya Dhanashree', 'Shree', 'Basant', 'Lalit'],
  Marwa: ['Marwa', 'Puriya', 'Sohni'],
  Kafi: ['Kafi', 'Bhimpalasi', 'Bageshri', 'Bahar', 'Brindavani Sarang', 'Madhyamad Sarang', 'Piloo', 'Shivranjani', 'Dhani', 'Malgunji', 'Gaud Malhar'],
  Asavari: ['Asavari', 'Jaunpuri', 'Darbari Kanada', 'Adana', 'Desi'],
  Bhairavi: ['Bhairavi', 'Malkauns', 'Bhupal Todi', 'Bilaskhani Todi'],
};

test('includes exactly the supplied 66 ragas, with original spellings and family assignments, in A-Z order', () => {
  const expected = Object.values(requested).flat().sort((a, b) => a.localeCompare(b, 'en'));
  expect(ragaOptions.map(option => option.label)).toEqual(expected);
  expect(ragas).toHaveLength(66);
  for (const [thaat, names] of Object.entries(requested)) {
    for (const name of names) expect(getRaga(name)?.thaat).toBe(thaat);
  }
});

test.each(ragas.map(raga => [raga.name, raga] as const))('%s has an ordered, duplicate-free reference inventory and a source', (_, raga) => {
  const intervals = raga.notes.map(key => swaras[key].interval);
  expect(intervals).toEqual([...new Set(intervals)].sort((a, b) => a - b));
  expect(raga.notes[0]).toBe('S');
  expect(raga.notes.at(-1)).toBe("S'");
  expect(raga.source).toMatch(/^https:\/\/(ragajunglism\.org\/ragas|tanarang\.com\/raag-)/);
});

test.each<[string, SwaraKey[]]>([
  ['Bhoopali', ['S', 'R', 'G', 'P', 'D', "S'"]],
  ['Malkauns', ['S', 'g', 'M', 'd', 'n', "S'"]],
  ['Khamaj', ['S', 'R', 'G', 'M', 'P', 'D', 'n', 'N', "S'"]],
  ['Yaman', ['S', 'R', 'G', 'M#', 'P', 'D', 'N', "S'"]],
  ['Yaman Kalyan', ['S', 'R', 'G', 'M', 'M#', 'P', 'D', 'N', "S'"]],
  ['Bhankar', ['S', 'r', 'G', 'M', 'M#', 'P', 'd', 'D', 'N', "S'"]],
  ['Malgunji', ['S', 'R', 'g', 'G', 'M', 'P', 'D', 'n', 'N', "S'"]],
  ['Gorakh Kalyan', ['S', 'R', 'M', 'D', 'n', "S'"]],
])('%s uses its raga inventory rather than blindly copying its thaat', (name, expected) => {
  expect(getRaga(name)?.notes).toEqual(expected);
});

test('raga mapping reuses independent reference and mapped-flute pitch calculations', () => {
  const state = { ...initialRagaState, raga: 'Bhoopali' as const, reference: 4 };
  expect(mapRaga(state).map(note => note.pitch)).toEqual(['E4', 'F#4', 'G#4', 'B4', 'C#5', 'E5']);
  expect(mapRaga(state)[0].pattern).toBe('XOOOOO');
  expect(mapRaga({ ...state, flute: 4 })[0].pattern).toBe('XXXOOO');
});

test('web selection transitions preserve the existing reset and alternate-fingering behavior', () => {
  let state = ragaReducer(initialRagaState, { type: 'select', value: 'P' });
  state = ragaReducer(state, { type: 'alternate', value: true });
  state = ragaReducer(state, { type: 'flats', value: true });
  expect(mapRaga(state).find(note => note.key === 'P')?.pattern).toBe('OXXXXX');
  state = ragaReducer(state, { type: 'reference', value: 4 });
  expect(state).toMatchObject({ selected: 'P', alternate: false, flats: true });
  state = ragaReducer(state, { type: 'raga', value: 'Malkauns' });
  expect(state).toMatchObject({ selected: 'S', alternate: false });
  expect(ragaReducer(state, { type: 'select', value: 'P' })).toBe(state);
  expect(ragaReducer(state, { type: 'raga', value: 'Unknown' })).toBe(state);
  expect(ragaReducer(state, { type: 'reset' })).toEqual(initialRagaState);
});
