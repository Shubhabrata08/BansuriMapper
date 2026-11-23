import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, serif } from './theme';

export type Choice = { value: string; label: string };

export function ChoiceField({ label, value, options, hint, onChange }: {
  label: string; value: string; options: readonly Choice[]; hint: string; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<React.ComponentRef<typeof View>>(null);
  const selected = options.find(option => option.value === value);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Pressable ref={trigger} accessibilityRole="button" accessibilityLabel={label} accessibilityValue={{ text: selected?.label }} accessibilityHint={hint} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <Text style={styles.value}>{selected?.label}</Text><Text style={styles.chevron}>{'\u2304'}</Text>
      </Pressable>
      <Text style={styles.hint}>{hint}</Text>
      <Modal visible={open} animationType="none" presentationStyle="pageSheet" supportedOrientations={['portrait', 'landscape']} onRequestClose={() => setOpen(false)} onDismiss={() => trigger.current?.focus()}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.title}>{label}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Close ${label}`} onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeText}>Done</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.options}>
              {options.map(option => (
                <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: value === option.value }} onPress={() => { if (option.value !== value) onChange(option.value); setOpen(false); }} style={({ pressed }) => [styles.option, value === option.value && styles.selected, pressed && styles.pressed]}>
                  <Text style={styles.value}>{option.label}</Text>
                  {value === option.value && <Text style={styles.check}>{'\u2713'}</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  trigger: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.input },
  value: { flex: 1, fontSize: 15, color: colors.ink },
  chevron: { fontSize: 20, color: colors.muted },
  hint: { fontSize: 12, lineHeight: 18, color: colors.muted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, color: colors.gold, fontSize: 26, fontFamily: serif },
  close: { padding: 12, minHeight: 48, justifyContent: 'center' },
  closeText: { color: colors.gold, fontWeight: '700', fontSize: 16 },
  options: { padding: 20, paddingTop: 0, gap: 10 },
  option: { padding: 16, minHeight: 54, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, flexDirection: 'row', alignItems: 'center', gap: 8 },
  selected: { backgroundColor: colors.selected, borderColor: colors.gold },
  check: { color: colors.gold, fontSize: 18 },
  pressed: { opacity: 0.75 },
});
