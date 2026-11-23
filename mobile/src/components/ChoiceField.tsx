import { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, RadioButton, Text } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';

export type Choice = { value: string; label: string };

export function ChoiceField({ label, value, options, hint, onChange }: {
  label: string; value: string; options: readonly Choice[]; hint: string; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<React.ComponentRef<typeof Button>>(null);
  const selected = options.find(option => option.value === value);
  return (
    <View style={styles.field}>
      <Text variant="labelLarge">{label}</Text>
      <Button ref={trigger} mode="outlined" icon="chevron-down" accessibilityLabel={`${label}, ${selected?.label}`} accessibilityHint={hint} onPress={() => setOpen(true)} style={styles.trigger} contentStyle={styles.triggerContent} labelStyle={styles.value}>
        {selected?.label}
      </Button>
      <Text variant="bodySmall" style={styles.hint}>{hint}</Text>
      <Modal visible={open} animationType="none" presentationStyle="pageSheet" supportedOrientations={['portrait', 'landscape']} onRequestClose={() => setOpen(false)} onDismiss={() => {
        const node = trigger.current;
        if (node && 'focus' in node && typeof node.focus === 'function') node.focus();
      }}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" variant="headlineSmall" style={styles.title}>{label}</Text>
              <Button mode="text" accessibilityLabel={`Close ${label}`} onPress={() => setOpen(false)}>Done</Button>
            </View>
            <Divider />
            <ScrollView contentContainerStyle={styles.options}>
              <RadioButton.Group value={value} onValueChange={next => { if (next !== value) onChange(next); setOpen(false); }}>
                {options.map(option => <RadioButton.Item key={option.value} value={option.value} label={option.label} mode="android" position="leading" labelStyle={styles.optionLabel} style={[styles.option, value === option.value && styles.selected]} />)}
              </RadioButton.Group>
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  trigger: { borderRadius: 8, backgroundColor: colors.input },
  triggerContent: { minHeight: 52, flexDirection: 'row-reverse', justifyContent: 'space-between' },
  value: { flexShrink: 1, textAlign: 'left', color: colors.ink },
  hint: { color: colors.muted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
  options: { padding: 16 },
  option: { minHeight: 56, borderRadius: 8, marginBottom: 4 },
  optionLabel: { textAlign: 'left' },
  selected: { backgroundColor: colors.selected },
});
