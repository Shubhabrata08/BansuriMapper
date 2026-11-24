import { mapNote, type SwaraKey } from './mapper';
import { getRaga, type RagaName } from './raga-catalog.web';

export type RagaState = {
  raga: RagaName;
  reference: number;
  flute: number;
  flats: boolean;
  alternate: boolean;
  selected: SwaraKey;
};

export const initialRagaState: RagaState = {
  raga: 'Bhairav', reference: 0, flute: 0, flats: false, alternate: false, selected: 'S',
};

type Action =
  | { type: 'raga'; value: string }
  | { type: 'reference' | 'flute'; value: number }
  | { type: 'flats' | 'alternate'; value: boolean }
  | { type: 'select'; value: SwaraKey }
  | { type: 'reset' };

export function ragaReducer(state: RagaState, action: Action): RagaState {
  switch (action.type) {
    case 'raga': return getRaga(action.value) ? { ...state, raga: action.value as RagaName, selected: 'S', alternate: false } : state;
    case 'reference':
    case 'flute': return { ...state, [action.type]: action.value, alternate: false };
    case 'flats':
    case 'alternate': return { ...state, [action.type]: action.value };
    case 'select': return getRaga(state.raga)!.notes.includes(action.value) ? { ...state, selected: action.value } : state;
    case 'reset': return { ...initialRagaState };
  }
}

export function mapRaga(state: RagaState) {
  return getRaga(state.raga)!.notes.map(key => mapNote(key, state.reference, state.flute, state.flats, state.alternate));
}
