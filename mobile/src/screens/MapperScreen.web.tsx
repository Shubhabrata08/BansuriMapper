import { useReducer, useState, useSyncExternalStore } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Card, Chip, Divider, Icon, SegmentedButtons, Surface, Switch, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceField } from '../components/ChoiceField';
import { NoteSlider } from '../components/NoteSlider.web';
import { Hole, HoleDiagram } from '../components/HoleDiagram';
import { colors, monospace } from '../components/theme';
import { mapNote, rootName } from '../domain/mapper';
import { getRaga, ragaOptions } from '../domain/raga-catalog.web';
import { initialRagaState, mapRaga, ragaReducer } from '../domain/raga-mapper.web';

const references = [
  { label: 'Six-hole bansuri swara chart', url: 'https://bikashacharya.com/sangeet-yatra/basuri/swaras.html' },
  { label: 'Interactive fingering chart', url: 'https://www.anubodh.com/fingering-charts.php' },
];

const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function MapperScreen() {
  const [state, dispatch] = useReducer(ragaReducer, initialRagaState);
  const [linkError, setLinkError] = useState('');
  const { width, fontScale } = useWindowDimensions();
  // Match the prerendered mobile tree before moving panels into desktop columns.
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const wide = hydrated && width >= 768 && fontScale <= 1.3;
  const twoColumns = hydrated && width >= 600 && fontScale <= 1.3;
  const settingsColumns = twoColumns && !wide;
  const notes = mapRaga(state);
  const raga = getRaga(state.raga)!;
  const detail = mapNote(state.selected, state.reference, state.flute, state.flats, state.alternate);
  const referenceName = rootName(state.reference, state.flats);
  const fluteName = rootName(state.flute, state.flats);

  async function openReference(url: string) {
    try { await Linking.openURL(url); setLinkError(''); }
    catch { setLinkError('The reference could not be opened. Please check that a browser is available.'); }
  }

  const controls = (
    <Card mode="outlined">
      <Card.Content style={styles.panelContent} testID="controls-panel">
        <View style={styles.sectionHeading}><Icon source="tune-variant" size={22} color={colors.gold} /><Text variant="titleLarge" accessibilityRole="header">Raga &amp; instruments</Text></View>
        <View style={styles.fields}>
          <View style={[styles.field, settingsColumns && styles.halfField]}>
            <ChoiceField label="Raga" value={state.raga} options={ragaOptions} hint="66 reference note sets, arranged A-Z." onChange={value => dispatch({ type: 'raga', value })} />
          </View>
          <View style={[styles.field, settingsColumns && styles.halfField]}>
            <NoteSlider label="Reference Tanpura" instrument="tanpura" value={state.reference} flats={state.flats} hint="Sets the reference Sa, not the mapped flute's key." onValueChange={value => dispatch({ type: 'reference', value })} testID="reference-slider" />
          </View>
          <View style={[styles.field, settingsColumns && styles.halfField]}>
            <NoteSlider label="Mapped bansuri" instrument="bansuri" value={state.flute} flats={state.flats} hint="Choose your bansuri's native Sa key." onValueChange={value => dispatch({ type: 'flute', value })} testID="flute-slider" />
          </View>
          <View style={[styles.field, settingsColumns && styles.halfField]}>
            <Text variant="labelLarge">Western note spelling</Text>
            <SegmentedButtons value={state.flats ? 'flats' : 'sharps'} onValueChange={value => dispatch({ type: 'flats', value: value === 'flats' })} buttons={[
                  { value: 'sharps', label: 'Sharps (#)', accessibilityLabel: 'Sharps', showSelectedCheck: true, style: styles.segment },
                  { value: 'flats', label: 'Flats (\u266d)', accessibilityLabel: 'Flats', showSelectedCheck: true, style: styles.segment },
                ]} />
            <Text variant="bodySmall" style={styles.muted}>Choose one accidental style for all Western pitch names and flute keys.</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions><Button mode="text" icon="restore" accessibilityLabel="Reset to C Bhairav" onPress={() => dispatch({ type: 'reset' })}>{'Reset to C \u00b7 Bhairav'}</Button></Card.Actions>
    </Card>
  );

  const summary = (
    <View style={styles.summary}>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" testID="summary" variant="headlineSmall" style={styles.gold}>{`${state.raga} / ${referenceName} tanpura \u00b7 ${fluteName} flute`}</Text>
      <View style={styles.pills}>
        {[`Reference Tanpura Sa = ${referenceName}`, `Mapped flute = ${fluteName}`, `Notation = ${state.flats ? 'Flats (\u266d)' : 'Sharps (#)'}`, 'Flute\u2019s Sa = H1\u2013H3 closed'].map(label => <Chip key={label} mode="outlined" accessibilityRole="text" textStyle={styles.chipLabel} style={styles.chip}>{label}</Chip>)}
      </View>
    </View>
  );

  const referenceNotes = (
    <Surface elevation={1} style={styles.sequence} accessibilityLabel="Raga reference note set">
      <Text variant="labelMedium" style={styles.muted}>{`REFERENCE NOTES \u00b7 ${referenceName} TANPURA`}</Text>
      <View style={styles.sequenceNotes}>
        {notes.map((note, index) => (
          <View key={note.key} style={styles.sequenceItem}>
            {index > 0 && <Text style={styles.arrow}>{'\u00b7'}</Text>}
            <Text variant="titleMedium">{note.token} <Text style={styles.gold}>{note.pitch}</Text></Text>
          </View>
              ))}
      </View>
      <Text variant="bodySmall" style={styles.muted}>Notes are ordered by pitch for fingering reference, not as an aroha/avaroha. Raga movement and ornamentation are not represented.</Text>
      {!!raga.variantNote && <Text testID="raga-variant-note" variant="bodySmall" style={styles.muted}>{raga.variantNote}</Text>}
    </Surface>
  );

  const detailPanel = (
    <Card mode="outlined" nativeID="web-fingering-detail">
      <Card.Content style={styles.panelContent} testID="fingering-detail">
        <Text variant="labelMedium" style={styles.muted}>SELECTED SWARA</Text>
        <View style={styles.detailHead}>
          <Text testID="selected-swar" variant="displayMedium" style={styles.gold}>{detail.token}</Text>
          <View style={styles.pitchGroup}>
            <Text testID="selected-pitch" variant="headlineMedium" style={styles.alignRight}>{detail.pitch}</Text>
            <Text testID="selected-frequency" style={[styles.small, styles.alignRight]}>{`${detail.frequency.toFixed(1)} Hz \u00b7 sounding pitch`}</Text>
            <Text testID="selected-relative" style={[styles.relative, styles.alignRight]}>{detail.relativeText}</Text>
          </View>
        </View>
        <Divider />
        <Text style={styles.small}>{'Required hole positions\nBlowing end \u2192 lower end'}</Text>
        <HoleDiagram pattern={detail.pattern} large />
        <View style={styles.legend}>
          {[['X', 'Closed'], ['H', 'Half-covered'], ['O', 'Open']].map(([value, label]) => (
            <View key={value} style={styles.legendItem}><Hole value={value} size={10} /><Text style={styles.small}>{label}</Text></View>
                ))}
        </View>
        <Surface elevation={0} style={styles.technique}>
          <Text testID="technique-title" variant="titleSmall" style={styles.gold}>{detail.title}</Text>
          <Text testID="technique-hint" variant="bodyMedium" style={styles.muted}>{detail.hint}</Text>
        </Surface>
        <Text style={styles.small}>{'Fingering code \u00b7 X closed / H half / O open'}</Text>
        <Text testID="fingering-code" style={styles.code}>{detail.pattern}</Text>
        {detail.canAlternate && (
        <View style={styles.alternate}>
          <Text style={[styles.small, styles.flex]}>{'Use alternate Pa fingering\n(H1 open, H2\u2013H6 closed)'}</Text>
          <Switch accessible={Platform.OS === 'android' ? true : undefined} accessibilityRole={Platform.OS === 'android' ? 'switch' : undefined} accessibilityLabel="Use alternate Pa fingering" value={state.alternate} onValueChange={value => dispatch({ type: 'alternate', value })} />
        </View>
              )}
      </Card.Content>
    </Card>
  );

  const mappingPanel = (
    <Card mode="outlined">
      <Card.Content style={styles.panelContent} testID="mapping-panel">
        <Text accessibilityRole="header" variant="titleLarge">Swara map</Text>
        <Text style={styles.small}>{'Sa-relative swaras \u00b7 flute-specific holes'}</Text>
        <View style={styles.noteList} testID="note-list">
          {notes.map(note => (
            <Card key={note.key} mode="outlined" style={[styles.noteCard, state.selected === note.key && styles.selected]}>
              <TouchableRipple testID={`note-${note.key}`} accessibilityRole="button" accessibilityState={{ selected: state.selected === note.key }} accessibilityLabel={`${note.name}, ${note.pitch}, ${note.relativeText}, ${note.frequency.toFixed(1)} Hz, ${note.pattern}`} accessibilityHint="Show this swara's fingering detail" onPress={() => {
                    dispatch({ type: 'select', value: note.key });
                    if (!wide) document.getElementById('web-fingering-detail')?.scrollIntoView({ block: 'start', behavior: 'auto' });
                  }} style={styles.noteRipple}>
                <View style={styles.note}>
                  <Text variant="headlineSmall" style={styles.noteToken}>{note.token}</Text>
                  <View style={styles.noteBody}>
                    <View style={styles.noteHead}>
                      <View style={styles.flex}><Text variant="titleSmall">{note.name}</Text><Text style={styles.small}>{note.subtitle}</Text></View>
                      <Text variant="titleLarge">{note.pitch}</Text>
                    </View>
                    <Text style={styles.small}>{`${note.relativeText} \u00b7 ${note.frequency.toFixed(1)} Hz`}</Text>
                    <HoleDiagram pattern={note.pattern} />
                  </View>
                </View>
              </TouchableRipple>
            </Card>
                ))}
        </View>
        <Text style={styles.small}>{'The six dots in each row are holes 1\u20136, from nearest the blowing end to furthest away. Swara identity comes from the Reference Tanpura\u2019s Sa and the chosen raga note set. The Western pitch is a separate sounding-pitch readout; it does not rename the swara.'}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView testID="mapper-scroll" contentContainerStyle={styles.scroll}>
        <View nativeID={hydrated ? 'mapper-ready' : 'mapper-pending'} style={styles.shell}>
          <View style={styles.header}>
            <Text variant="labelLarge" style={styles.topline}>HINDUSTANI FLUTE TOOLKIT</Text>
            <Text accessibilityRole="header" variant={twoColumns ? 'displaySmall' : 'headlineLarge'} style={styles.title}>Bansuri Fingering Mapper</Text>
            <Text variant="bodyMedium" style={styles.lede}>{'Choose a raga and slide to your tanpura and bansuri keys. Swaras stay relative to the tanpura\u2019s Sa; fingerings follow the mapped bansuri.'}</Text>
          </View>
          <View style={[styles.pageColumns, wide && styles.wideWorkspace]}>
            <View testID="controls-column" style={[styles.controlsColumn, wide && { width: Math.min(380, Math.max(280, width * 0.32)) }]}>
              {controls}
              {wide && detailPanel}
            </View>
            <View testID="mapping-column" style={[styles.mappingColumn, wide && styles.flex]}>
              {summary}
              {!wide && referenceNotes}
              {!wide && detailPanel}
              {mappingPanel}
              {wide && referenceNotes}
            </View>
          </View>
          <View style={[styles.info, twoColumns && styles.wideWorkspace]}>
            <Card mode="outlined" style={twoColumns && styles.flex}><Card.Content style={styles.panelContent}>
              <Text variant="titleSmall" style={styles.gold}>Reference Tanpura vs. mapped flute</Text>
              <Text variant="bodyMedium" style={styles.muted}>{'An E tanpura sets the reference Sa to E. If the flute being mapped is C, the app finds the C-flute fingering for that E pitch while keeping its swara label as Sa. Holes 1\u20133 closed define the mapped flute\u2019s own Sa, which may differ from the tanpura reference.'}</Text>
            </Card.Content></Card>
            <Card mode="outlined" style={twoColumns && styles.flex}><Card.Content style={styles.panelContent}>
              <Text variant="titleSmall" style={styles.gold}>Practical tuning note</Text>
              <Text variant="bodyMedium" style={styles.muted}>Six-hole fingering charts are reference patterns. Half-hole size, cross-fingerings, breath pressure and octave response vary between bamboo flutes and teachers. Tune each note against your chosen Sa drone; use the diagram as a starting point.</Text>
            </Card.Content></Card>
          </View>
          <Divider />
          <Text style={styles.small}>{'Six-hole reference: the flute\u2019s own Sa is on H1\u2013H3. Hole 1 is nearest the blowing end. Swaras in the map are relative to the Reference Tanpura.'}</Text>
          <View>
            {references.map(reference => <Button key={reference.url} mode="text" icon="open-in-new" accessibilityRole="link" accessibilityLabel={reference.label} onPress={() => void openReference(reference.url)} style={styles.link}>{reference.label}</Button>)}
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
  shell: { width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 24 },
  header: { gap: 12 },
  topline: { color: colors.gold, letterSpacing: 1.2 },
  title: { fontWeight: '600' },
  lede: { color: colors.muted, maxWidth: 760 },
  panelContent: { padding: 20, gap: 16, minWidth: 0 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  field: { width: '100%', gap: 8 },
  halfField: { width: '47%', flexGrow: 1 },
  muted: { color: colors.muted },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  segment: { minHeight: 52, justifyContent: 'center' },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  summary: { gap: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.background },
  chipLabel: { color: colors.muted, fontSize: 12 },
  sequence: { padding: 16, borderRadius: 12, gap: 12 },
  sequenceNotes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sequenceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { color: colors.muted },
  gold: { color: colors.gold },
  pageColumns: { gap: 24, alignItems: 'stretch' },
  controlsColumn: { gap: 24, minWidth: 0 },
  mappingColumn: { gap: 24, minWidth: 0 },
  wideWorkspace: { flexDirection: 'row', alignItems: 'flex-start' },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pitchGroup: { flex: 1, gap: 5 },
  relative: { color: colors.gold, fontSize: 12, lineHeight: 18 },
  alignRight: { textAlign: 'right' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  technique: { backgroundColor: colors.technique, padding: 16, borderRadius: 12, gap: 8 },
  code: { fontFamily: monospace, color: colors.ink, letterSpacing: 3, fontSize: 17 },
  alternate: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  noteList: { gap: 10 },
  noteCard: { backgroundColor: colors.input, overflow: 'hidden' },
  noteRipple: { borderRadius: 12 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16 },
  noteToken: { width: 42, color: colors.gold },
  noteBody: { flex: 1, gap: 8, minWidth: 0 },
  noteHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 },
  info: { gap: 14 },
  link: { alignSelf: 'flex-start' },
});
