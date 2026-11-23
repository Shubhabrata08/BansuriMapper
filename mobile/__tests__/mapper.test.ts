import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { initialState, mapNote, mapperReducer, mapScale, thaats, type SwaraKey, type Thaat } from '../src/domain/mapper';

type ReferenceCase = {
  thaat: Thaat; key: SwaraKey; reference: number; flute: number; flats: boolean; alternate: boolean;
  name: string; subtitle: string; token: string; pitch: string; midi: number; frequency: number;
  relative: number; relativeText: string; pattern: string; title: string; hint: string; canAlternate: boolean;
};
const fixture = JSON.parse(readFileSync(path.join(__dirname, '..', '.test-data', 'reference.json'), 'utf8')) as {
  thaats: Record<Thaat, SwaraKey[]>; cases: ReferenceCase[];
};

describe('Original HTML parity', () => {
  test('preserves the source thaat definitions, including Marwa without Pa', () => {
    expect(thaats).toEqual(fixture.thaats);
    expect(fixture.cases).toHaveLength(45504);
  });

  test.each(Object.keys(thaats) as Thaat[])('%s: every root pair, spelling, alternate setting and swara', thaat => {
    for (const expected of fixture.cases.filter(item => item.thaat === thaat)) {
      const actual = mapNote(expected.key, expected.reference, expected.flute, expected.flats, expected.alternate);
      const label = `${thaat}/${expected.key}/${expected.reference}/${expected.flute}/${expected.flats}/${expected.alternate}`;
      for (const field of ['key', 'name', 'subtitle', 'token', 'pitch', 'midi', 'relative', 'relativeText', 'pattern', 'title', 'hint', 'canAlternate'] as const) {
        assert.equal(actual[field], expected[field], `${label} ${field}`);
      }
      assert.ok(Math.abs(actual.frequency - expected.frequency) < 1e-9, `${label} frequency`);
    }
  });
});

describe('Selection and reset transitions', () => {
  test('alternate Pa survives note/spelling changes but clears on flute changes', () => {
    let state = mapperReducer(initialState, { type: 'select', value: 'P' });
    state = mapperReducer(state, { type: 'alternate', value: true });
    state = mapperReducer(state, { type: 'select', value: 'S' });
    state = mapperReducer(state, { type: 'select', value: 'P' });
    state = mapperReducer(state, { type: 'flats', value: true });
    expect(mapScale(state).find(note => note.key === 'P')?.pattern).toBe('OXXXXX');
    state = mapperReducer(state, { type: 'reference', value: 4 });
    expect(state).toMatchObject({ selected: 'P', alternate: false, flats: true });
    state = mapperReducer(state, { type: 'alternate', value: true });
    state = mapperReducer(state, { type: 'flute', value: 7 });
    expect(state).toMatchObject({ selected: 'P', alternate: false });
  });

  test('thaat changes select Sa; unavailable notes cannot become selected; reset restores all fields', () => {
    let state = { ...initialState, selected: 'P' as SwaraKey, alternate: true, flats: true, reference: 5, flute: 6 };
    state = mapperReducer(state, { type: 'thaat', value: 'Marwa' });
    expect(state).toMatchObject({ selected: 'S', alternate: false });
    expect(mapScale(state)).toHaveLength(7);
    expect(mapperReducer(state, { type: 'select', value: 'P' })).toBe(state);
    expect(mapperReducer(state, { type: 'reset' })).toEqual(initialState);
  });
});
