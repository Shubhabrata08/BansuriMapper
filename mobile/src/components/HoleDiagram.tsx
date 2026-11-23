import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function holeState(hole: string) { return hole === 'X' ? 'Closed' : hole === 'H' ? 'Half-covered' : 'Open'; }

export function Hole({ value, size = 32 }: { value: string; size?: number }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, value === 'X' && styles.closed, value === 'H' && styles.half]}>
      {value === 'H' && <View style={styles.halfFill} />}
      {size > 20 && value !== 'O' && <Text allowFontScaling={false} style={styles.symbol}>{value === 'X' ? 'X' : '\u00bd'}</Text>}
    </View>
  );
}

export function HoleDiagram({ pattern, large = false }: { pattern: string; large?: boolean }) {
  const description = [...pattern].map((value, i) => `Hole ${i + 1}: ${holeState(value)}`).join(', ');
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={description} style={[styles.row, large && styles.diagram]}>
      {[...pattern].map((value, i) => (
        <View key={i} style={large ? styles.hole : undefined}>
          <Hole value={value} size={large ? 30 : 12} />
          {large && <Text style={styles.label}>{`H${i + 1}`}</Text>}
          {large && <Text style={styles.state}>{value === 'H' ? 'Half' : holeState(value)}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  diagram: { backgroundColor: '#223630', borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingVertical: 18, paddingHorizontal: 4, justifyContent: 'space-around' },
  hole: { flex: 1, alignItems: 'center', gap: 7 },
  circle: { borderWidth: 1.5, borderColor: colors.muted, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  closed: { backgroundColor: colors.mint, borderColor: colors.mint },
  half: { borderColor: colors.half },
  halfFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', backgroundColor: colors.half },
  symbol: { fontSize: 10, fontWeight: '800', color: colors.input },
  label: { fontSize: 11, color: colors.ink, maxWidth: '100%', textAlign: 'center' },
  state: { fontSize: 10, color: colors.muted, maxWidth: '100%', textAlign: 'center' },
});
