export const swaras = {
  S: { name: 'Sa', interval: 0, subtitle: 'Tonic', token: 'Sa' },
  r: { name: 'Komal Re', interval: 1, subtitle: 'Flattened second', token: 'r' },
  R: { name: 'Shuddha Re', interval: 2, subtitle: 'Major second', token: 'R' },
  g: { name: 'Komal Ga', interval: 3, subtitle: 'Flattened third', token: 'g' },
  G: { name: 'Shuddha Ga', interval: 4, subtitle: 'Major third', token: 'G' },
  M: { name: 'Shuddha Ma', interval: 5, subtitle: 'Perfect fourth', token: 'M' },
  'M#': { name: 'Tivra Ma', interval: 6, subtitle: 'Raised fourth', token: 'M\u266f' },
  P: { name: 'Pa', interval: 7, subtitle: 'Perfect fifth', token: 'P' },
  d: { name: 'Komal Dha', interval: 8, subtitle: 'Flattened sixth', token: 'd' },
  D: { name: 'Shuddha Dha', interval: 9, subtitle: 'Major sixth', token: 'D' },
  n: { name: 'Komal Ni', interval: 10, subtitle: 'Flattened seventh', token: 'n' },
  N: { name: 'Shuddha Ni', interval: 11, subtitle: 'Major seventh', token: 'N' },
  "S'": { name: 'Taar Sa', interval: 12, subtitle: 'Upper tonic', token: 'Sa\u2032' },
} as const;

export type SwaraKey = keyof typeof swaras;

export const thaats = {
  Bhairav: ['S', 'r', 'G', 'M', 'P', 'd', 'N', "S'"],
  Bilawal: ['S', 'R', 'G', 'M', 'P', 'D', 'N', "S'"],
  Khamaj: ['S', 'R', 'G', 'M', 'P', 'D', 'n', "S'"],
  Kafi: ['S', 'R', 'g', 'M', 'P', 'D', 'n', "S'"],
  Asavari: ['S', 'R', 'g', 'M', 'P', 'd', 'n', "S'"],
  Bhairavi: ['S', 'r', 'g', 'M', 'P', 'd', 'n', "S'"],
  Kalyan: ['S', 'R', 'G', 'M#', 'P', 'D', 'N', "S'"],
  Marwa: ['S', 'r', 'G', 'M#', 'D', 'N', "S'"],
  Poorvi: ['S', 'r', 'G', 'M#', 'P', 'd', 'N', "S'"],
  Todi: ['S', 'r', 'g', 'M#', 'P', 'd', 'N', "S'"],
} as const satisfies Record<string, readonly SwaraKey[]>;

export type Thaat = keyof typeof thaats;
const chromaticKeys: readonly SwaraKey[] = ['S', 'r', 'R', 'g', 'G', 'M', 'M#', 'P', 'd', 'D', 'n', 'N'];
const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const patterns = ['XXXOOO', 'XXHOOO', 'XXOOOO', 'XHOOOO', 'XOOOOO', 'HOOOOO', 'OOOOOO', 'XXXXXX', 'XXXXXH', 'XXXXXO', 'XXXXHO', 'XXXXOO'];
const hints = [
  'Close H1, H2 and H3. Leave H4\u2013H6 open. This is the selected flute\u2019s Sa reference.',
  'Close H1 and H2; half-cover H3 to produce the semitone above Sa.',
  'Close H1 and H2; leave H3\u2013H6 open.',
  'Close H1 and half-cover H2. Fine-tune against the Sa drone.',
  'Close H1; leave H2\u2013H6 open.',
  'Half-cover H1 and leave H2\u2013H6 open. Roll the finger to tune the note.',
  'Lift all six fingers. An alternate cross-fingering may speak more cleanly on some flutes.',
  'Close all six holes and use a faster, narrower air stream for madhya Pa. An alternate fingering is H1 open and H2\u2013H6 closed.',
  'Close H1\u2013H5 and half-cover H6. Use focused air and tune against the drone.',
  'Close H1\u2013H5 and leave H6 open. Use focused air.',
  'Close H1\u2013H4, half-cover H5 and leave H6 open.',
  'Close H1\u2013H4 and leave H5\u2013H6 open.',
];

export function modulo12(value: number) { return ((value % 12) + 12) % 12; }
export function rootName(pitchClass: number, flats: boolean) { return (flats ? flatNames : sharpNames)[modulo12(pitchClass)]; }

// Match the HTML's register convention: at the tritone choose F# below C4.
function fluteOffset(pitchClass: number) { return pitchClass >= 6 ? pitchClass - 12 : pitchClass; }

export function register(relative: number) {
  if (relative < 0) return 'Mandra \u00b7 lower register';
  if (relative <= 6) return 'Madhya \u00b7 normal register';
  if (relative <= 11) return 'Madhya \u00b7 upper register';
  if (relative <= 18) return 'Taar \u00b7 upper octave';
  return 'Ati-taar \u00b7 higher octave';
}

export function relativeDescription(relative: number) {
  if (relative === 0) return 'Same as this flute\u2019s Sa';
  const amount = Math.abs(relative);
  const name = swaras[chromaticKeys[modulo12(relative)]].name;
  const octave = relative < 0 ? ' \u00b7 Mandra' : relative >= 12 ? ' \u00b7 Taar' : '';
  return `${amount} ${amount === 1 ? 'semitone' : 'semitones'} ${relative < 0 ? 'below' : 'above'} flute Sa \u00b7 ${name}${octave}`;
}

export function mapNote(key: SwaraKey, reference: number, flute: number, flats: boolean, alternate: boolean) {
  const swara = swaras[key];
  const midi = 60 + fluteOffset(reference) + swara.interval;
  const relative = fluteOffset(reference) + swara.interval - fluteOffset(flute);
  const index = modulo12(relative);
  const canAlternate = index === 7 && relative >= 7;
  const useAlternate = alternate && canAlternate;
  const registerHint = relative < 0
    ? ' This note is below the flute\u2019s Sa, so use the lower-register, gentler air stream.'
    : relative >= 12 && relative <= 18
      ? ' This is in the taar saptak; use a faster, narrower air stream.'
      : relative >= 7 ? ' This note needs a focused upper-register air stream.' : '';
  return {
    key, ...swara, midi, relative, canAlternate,
    pitch: `${rootName(midi, flats)}${Math.floor(midi / 12) - 1}`,
    frequency: 440 * Math.pow(2, (midi - 69) / 12),
    pattern: useAlternate ? 'OXXXXX' : patterns[index],
    relativeText: relativeDescription(relative),
    title: `${swaras[chromaticKeys[index]].name} \u00b7 ${register(relative)}`,
    hint: (useAlternate
      ? 'Alternate Pa fingering: leave H1 open and close H2\u2013H6. Compare it with all six holes closed against the Sa drone.'
      : hints[index]) + registerHint,
  };
}

export type MappedNote = ReturnType<typeof mapNote>;
export type MapperState = { thaat: Thaat; reference: number; flute: number; flats: boolean; alternate: boolean; selected: SwaraKey };
export const initialState: MapperState = { thaat: 'Bhairav', reference: 0, flute: 0, flats: false, alternate: false, selected: 'S' };
export type Action =
  | { type: 'thaat'; value: Thaat }
  | { type: 'reference' | 'flute'; value: number }
  | { type: 'flats' | 'alternate'; value: boolean }
  | { type: 'select'; value: SwaraKey }
  | { type: 'reset' };

export function mapperReducer(state: MapperState, action: Action): MapperState {
  switch (action.type) {
    case 'thaat': return { ...state, thaat: action.value, alternate: false, selected: 'S' };
    case 'reference':
    case 'flute': return { ...state, [action.type]: action.value, alternate: false };
    case 'flats':
    case 'alternate': return { ...state, [action.type]: action.value };
    case 'select': return (thaats[state.thaat] as readonly SwaraKey[]).includes(action.value) ? { ...state, selected: action.value } : state;
    case 'reset': return { ...initialState };
  }
}

export function mapScale(state: MapperState) {
  return thaats[state.thaat].map(key => mapNote(key, state.reference, state.flute, state.flats, state.alternate));
}
