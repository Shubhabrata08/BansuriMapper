import { useReducer, useRef, useState, type ComponentRef } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceField } from '../components/ChoiceField';
import { Hole, HoleDiagram } from '../components/HoleDiagram';
import { colors, monospace, serif } from '../components/theme';
import { initialState, mapNote, mapperReducer, mapScale, rootName, thaats, type Thaat } from '../domain/mapper';

const thaatOptions = (Object.keys(thaats) as Thaat[]).map(value => ({ value, label: value }));
const references = [
  { label: 'Six-hole bansuri swara chart', url: 'https://bikashacharya.com/sangeet-yatra/basuri/swaras.html' },
  { label: 'Interactive fingering chart', url: 'https://www.anubodh.com/fingering-charts.php' },
];

export default function MapperScreen() {
  const [state, dispatch] = useReducer(mapperReducer, initialState);
  const [linkError, setLinkError] = useState('');
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 900 && fontScale <= 1.3;
  const twoColumns = width >= 600 && fontScale <= 1.3;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const workspaceY = useRef(0);
  const notes = mapScale(state);
  const detail = mapNote(state.selected, state.reference, state.flute, state.flats, state.alternate);
  const rootOptions = Array.from({ length: 12 }, (_, value) => {
    const name = rootName(value, state.flats);
    return { value: String(value), label: `${name} bansuri \u00b7 Sa sounds ${name}` };
  });
  const referenceName = rootName(state.reference, state.flats);
  const fluteName = rootName(state.flute, state.flats);

  async function openReference(url: string) {
    try { await Linking.openURL(url); setLinkError(''); }
    catch { setLinkError('The reference could not be opened. Please check that a browser is available.'); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scroll} testID="mapper-scroll" contentContainerStyle={styles.scroll}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <Text style={styles.topline}>{'\u25cf  HINDUSTANI FLUTE TOOLKIT'}</Text>
            <Text accessibilityRole="header" style={[styles.title, !twoColumns && styles.phoneTitle]}>Bansuri Fingering Mapper</Text>
            <Text style={styles.lede}>{'Choose a thaat, set the bansuri that defines your reference Sa, then choose the flute you are mapping. The Hindustani swaras stay relative to Sa (Sa, Re, Ga\u2026), while the app independently calculates the hole combinations needed on the flute in your hands.'}</Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.fields}>
              <View style={[styles.field, twoColumns && styles.halfField]}>
                <ChoiceField label="Thaat" value={state.thaat} options={thaatOptions} hint="Select one of the ten commonly taught Hindustani thaats." onChange={value => dispatch({ type: 'thaat', value: value as Thaat })} />
              </View>
              <View style={[styles.field, twoColumns && styles.halfField]}>
                <ChoiceField label={'Reference bansuri \u00b7 Sa'} value={String(state.reference)} options={rootOptions} hint={'Holes 1\u20133 closed are always called Sa. This setting defines Sa\u2019s actual pitch.'} onChange={value => dispatch({ type: 'reference', value: Number(value) })} />
              </View>
              <View style={[styles.field, twoColumns && styles.halfField]}>
                <ChoiceField label="Flute being mapped" value={String(state.flute)} options={rootOptions} hint="Choose the instrument you will play. The app calculates its hole pattern for each reference swara." onChange={value => dispatch({ type: 'flute', value: Number(value) })} />
              </View>
              <View style={[styles.field, twoColumns && styles.halfField]}>
                <Text style={styles.eyebrow}>WESTERN NOTE SPELLING</Text>
                <View style={styles.notation} accessibilityRole="radiogroup" accessibilityLabel="Western note spelling">
                  {[false, true].map(flats => (
                    <Pressable key={String(flats)} accessibilityRole="radio" accessibilityLabel={flats ? 'Flats' : 'Sharps'} accessibilityState={{ checked: state.flats === flats }} onPress={() => dispatch({ type: 'flats', value: flats })} style={({ pressed }) => [styles.notationButton, state.flats === flats && styles.selected, pressed && styles.pressed]}>
                      <Text style={styles.buttonText}>{flats ? 'Flats (\u266d)' : 'Sharps (#)'}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.small}>Choose one accidental style for all Western pitch names and flute keys.</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Reset to C Bhairav" onPress={() => dispatch({ type: 'reset' })} style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>{'Reset to C \u00b7 Bhairav'}</Text>
            </Pressable>
          </View>

          <View style={styles.summary}>
            <Text accessibilityRole="header" accessibilityLiveRegion="polite" testID="summary" style={styles.summaryTitle}>{`${state.thaat} / ${referenceName} reference \u00b7 ${fluteName} flute`}</Text>
            <View style={styles.pills}>
              {[`Reference bansuri Sa = ${referenceName}`, `Mapped flute = ${fluteName}`, `Notation = ${state.flats ? 'Flats (\u266d)' : 'Sharps (#)'}`, 'Sa = H1\u2013H3 closed'].map(label => <Text key={label} style={styles.pill}>{label}</Text>)}
            </View>
          </View>

          <View style={[styles.panel, styles.sequence]} accessibilityLabel="Ascending scale notes">
            <Text style={styles.eyebrow}>{`SARGAM \u00b7 ${referenceName} REFERENCE`}</Text>
            <View style={styles.sequenceNotes}>
              {notes.map((note, index) => (
                <View key={note.key} style={styles.sequenceItem}>
                  {index > 0 && <Text style={styles.arrow}>{'\u2192'}</Text>}
                  <Text style={styles.sequenceText}>{note.token} <Text style={styles.gold}>{note.pitch}</Text></Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.workspace, wide && styles.wideWorkspace]} onLayout={event => { workspaceY.current = event.nativeEvent.layout.y; }}>
            <View style={[styles.panel, wide && styles.detailColumn]} testID="fingering-detail">
              <Text style={styles.eyebrow}>{'SELECTED SWARA \u00b7 FINGERING DETAIL'}</Text>
              <View style={styles.detailHead}>
                <Text testID="selected-swar" style={styles.selectedSwar}>{detail.token}</Text>
                <View style={styles.pitchGroup}>
                  <Text testID="selected-pitch" style={styles.selectedPitch}>{detail.pitch}</Text>
                  <Text testID="selected-frequency" style={[styles.small, styles.alignRight]}>{`${detail.frequency.toFixed(1)} Hz \u00b7 sounding pitch`}</Text>
                  <Text testID="selected-relative" style={[styles.relative, styles.alignRight]}>{detail.relativeText}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.small}>{'Required hole positions\nBlowing end \u2192 lower end'}</Text>
              <HoleDiagram pattern={detail.pattern} large />
              <View style={styles.legend}>
                {[['X', 'Closed'], ['H', 'Half-covered'], ['O', 'Open']].map(([value, label]) => (
                  <View key={value} style={styles.legendItem}><Hole value={value} size={10} /><Text style={styles.small}>{label}</Text></View>
                ))}
              </View>
              <View style={styles.technique}>
                <Text testID="technique-title" style={styles.techniqueTitle}>{detail.title}</Text>
                <Text testID="technique-hint" style={styles.body}>{detail.hint}</Text>
              </View>
              <Text style={styles.small}>{'Fingering code \u00b7 X closed / H half / O open'}</Text>
              <Text testID="fingering-code" style={styles.code}>{detail.pattern}</Text>
              {detail.canAlternate && (
                <View style={styles.alternate}>
                  <Switch accessible={Platform.OS === 'android' ? true : undefined} accessibilityRole={Platform.OS === 'android' ? 'switch' : undefined} accessibilityLabel="Use alternate Pa fingering" value={state.alternate} onValueChange={value => dispatch({ type: 'alternate', value })} trackColor={{ false: colors.line, true: colors.gold }} thumbColor={colors.ink} />
                  <Text style={[styles.small, styles.flex]}>{'Use alternate Pa fingering\n(H1 open, H2\u2013H6 closed)'}</Text>
                </View>
              )}
            </View>

            <View style={[styles.panel, wide && styles.mapColumn]}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Swara map</Text>
              <Text style={styles.small}>{'Sa-relative swaras \u00b7 flute-specific holes'}</Text>
              <View style={styles.noteList} testID="note-list">
                {notes.map(note => (
                  <Pressable key={note.key} testID={`note-${note.key}`} accessibilityRole="button" accessibilityState={{ selected: state.selected === note.key }} accessibilityLabel={`${note.name}, ${note.pitch}, ${note.relativeText}, ${note.frequency.toFixed(1)} Hz, ${note.pattern}`} accessibilityHint="Show this swara's fingering detail" onPress={() => {
                    dispatch({ type: 'select', value: note.key });
                    if (!wide) scroll.current?.scrollTo({ y: workspaceY.current, animated: false });
                  }} style={({ pressed }) => [styles.note, state.selected === note.key && styles.selected, pressed && styles.pressed]}>
                    <Text style={styles.noteToken}>{note.token}</Text>
                    <View style={styles.noteBody}>
                      <View style={styles.noteHead}>
                        <View style={styles.flex}><Text style={styles.noteName}>{note.name}</Text><Text style={styles.small}>{note.subtitle}</Text></View>
                        <Text style={styles.notePitch}>{note.pitch}</Text>
                      </View>
                      <Text style={styles.small}>{`${note.relativeText} \u00b7 ${note.frequency.toFixed(1)} Hz`}</Text>
                      <HoleDiagram pattern={note.pattern} />
                    </View>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.small}>{'The six dots in each row are holes 1\u20136, from nearest the blowing end to furthest away. Swara identity comes from the selected reference bansuri\u2019s Sa and the chosen thaat. The Western pitch is a separate sounding-pitch readout; it does not rename the swara.'}</Text>
            </View>
          </View>

          <View style={[styles.info, twoColumns && styles.wideWorkspace]}>
            <View style={[styles.panel, twoColumns && styles.flex]}>
              <Text style={styles.infoTitle}>REFERENCE SA VS. MAPPED FLUTE</Text>
              <Text style={styles.body}>{'The reference bansuri defines the real-world pitch of Sa. For example, choosing an E reference bansuri means H1\u2013H3 closed is called Sa and sounds E. If the flute being mapped is C, the app finds the C-flute fingering that reproduces that same E pitch, while keeping the swara label as Sa.'}</Text>
            </View>
            <View style={[styles.panel, twoColumns && styles.flex]}>
              <Text style={styles.infoTitle}>PRACTICAL TUNING NOTE</Text>
              <Text style={styles.body}>Six-hole fingering charts are reference patterns. Half-hole size, cross-fingerings, breath pressure and octave response vary between bamboo flutes and teachers. Tune each note against your chosen Sa drone; use the diagram as a starting point.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.small}>{'Six-hole reference: Sa on H1\u2013H3 \u00b7 Hole 1 is nearest the blowing end. Swaras are relative to the selected reference bansuri.'}</Text>
          <View>
            {references.map(reference => <Pressable key={reference.url} accessibilityRole="link" accessibilityLabel={reference.label} onPress={() => void openReference(reference.url)} style={styles.link}><Text style={styles.gold}>{reference.label}</Text></Pressable>)}
            {!!linkError && <Text accessibilityRole="alert" style={styles.body}>{linkError}</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 18, paddingBottom: 36 },
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 20 },
  header: { gap: 12 },
  topline: { color: colors.gold, fontWeight: '800', fontSize: 11, letterSpacing: 1.6 },
  title: { color: colors.ink, fontFamily: serif, fontSize: 48 },
  phoneTitle: { fontSize: 36 },
  lede: { color: colors.muted, fontSize: 15, lineHeight: 24, maxWidth: 760 },
  panel: { padding: 18, borderRadius: 18, borderColor: colors.line, borderWidth: 1, backgroundColor: colors.panel, gap: 14, minWidth: 0 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  field: { width: '100%', gap: 8 },
  halfField: { width: '47%', flexGrow: 1 },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  notation: { flexDirection: 'row', gap: 6 },
  notationButton: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.input },
  buttonText: { color: colors.ink, fontSize: 14, textAlign: 'center' },
  reset: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.line, padding: 12, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  pressed: { opacity: 0.75 },
  summary: { gap: 12 },
  summaryTitle: { fontFamily: serif, fontSize: 28, color: colors.gold },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, color: colors.muted, fontSize: 11 },
  sequence: { gap: 10 },
  sequenceNotes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sequenceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sequenceText: { fontFamily: serif, fontSize: 18, color: colors.ink },
  arrow: { color: colors.muted },
  gold: { color: colors.gold },
  workspace: { gap: 18, alignItems: 'stretch' },
  wideWorkspace: { flexDirection: 'row', alignItems: 'flex-start' },
  detailColumn: { flex: 0.9 },
  mapColumn: { flex: 1.4 },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  selectedSwar: { fontSize: 48, color: colors.gold, fontFamily: serif },
  pitchGroup: { flex: 1, gap: 5 },
  selectedPitch: { fontSize: 27, color: colors.ink, fontWeight: '600', textAlign: 'right' },
  relative: { color: colors.gold, fontSize: 12, lineHeight: 18 },
  alignRight: { textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.line },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  technique: { backgroundColor: colors.technique, padding: 14, borderWidth: 1, borderColor: '#5a5138', borderRadius: 12, gap: 8 },
  techniqueTitle: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  code: { fontFamily: monospace, color: colors.ink, letterSpacing: 3, fontSize: 17 },
  alternate: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  sectionTitle: { fontFamily: serif, fontSize: 26, color: colors.ink },
  noteList: { gap: 10 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.input },
  noteToken: { width: 42, fontFamily: serif, fontSize: 25, color: colors.gold },
  noteBody: { flex: 1, gap: 8, minWidth: 0 },
  noteHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 },
  noteName: { color: colors.ink, fontSize: 14 },
  notePitch: { color: colors.ink, fontSize: 19, fontWeight: '600' },
  info: { gap: 14 },
  infoTitle: { color: colors.gold, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  link: { minHeight: 48, justifyContent: 'center', paddingVertical: 10 },
});
