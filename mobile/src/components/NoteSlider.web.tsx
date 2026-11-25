import { useId, type CSSProperties } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { rootName } from '../domain/mapper';
import { colors } from './theme';

type Props = {
  label: string;
  instrument: 'tanpura' | 'bansuri';
  value: number;
  flats: boolean;
  hint: string;
  onValueChange: (value: number) => void;
  testID: string;
};

export function NoteSlider({ label, instrument, value, flats, hint, onValueChange, testID }: Props) {
  const id = useId();
  const theme = useTheme();
  const valueText = `${rootName(value, flats)} ${instrument}`;
  const trackStyle: CSSProperties & { '--note-progress': string } = { '--note-progress': `${value / 11 * 100}%` };
  return (
    <View style={styles.field} testID={testID}>
      <View style={styles.heading}>
        <Text nativeID={`${id}-label`} variant="labelLarge" style={styles.label}>{label}</Text>
        <Text variant="labelLarge" style={styles.value}>{valueText}</Text>
      </View>
      <style>{`
        .bansuri-note-slider {
          appearance: none; -webkit-appearance: none; width: 100%; min-width: 0;
          height: 44px; margin: 0; background: transparent; cursor: pointer;
          border-radius: 6px; touch-action: pan-y;
        }
        .bansuri-note-slider:focus-visible { outline: 2px solid ${colors.gold}; outline-offset: 2px; }
        .bansuri-note-slider::-webkit-slider-runnable-track {
          height: 6px; border-radius: 3px;
          background: linear-gradient(to right, ${colors.gold} var(--note-progress), ${colors.line} var(--note-progress));
        }
        .bansuri-note-slider::-moz-range-track {
          height: 6px; border-radius: 3px;
          background: linear-gradient(to right, ${colors.gold} var(--note-progress), ${colors.line} var(--note-progress));
        }
        .bansuri-note-slider::-moz-range-progress { height: 6px; border-radius: 3px; background: ${colors.gold}; }
        .bansuri-note-slider::-webkit-slider-thumb {
          box-sizing: border-box; appearance: none; -webkit-appearance: none; width: 24px; height: 24px;
          margin-top: -9px; border-radius: 50%; border: 3px solid ${colors.background};
          background: ${colors.gold}; box-shadow: 0 0 0 1px ${colors.gold};
        }
        .bansuri-note-slider::-moz-range-thumb {
          box-sizing: border-box; width: 24px; height: 24px; border-radius: 50%;
          border: 3px solid ${colors.background}; background: ${colors.gold};
          box-shadow: 0 0 0 1px ${colors.gold};
        }
      `}</style>
      <input
        id={id}
        className="bansuri-note-slider"
        type="range"
        min={0}
        max={11}
        step={1}
        value={value}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        aria-valuetext={valueText}
        style={trackStyle}
        onChange={event => onValueChange(event.currentTarget.valueAsNumber)}
      />
      <div aria-hidden="true" style={{ position: 'relative', height: 18, margin: '0 12px', fontFamily: theme.fonts.labelSmall.fontFamily, fontSize: 11 }}>
        {Array.from({ length: 12 }, (_, pitchClass) => (
          <span key={pitchClass} data-note={pitchClass} style={{ position: 'absolute', left: `${pitchClass / 11 * 100}%`, transform: 'translateX(-50%)', color: pitchClass === value ? colors.gold : colors.muted, fontWeight: pitchClass === value ? 700 : 400 }}>
            {rootName(pitchClass, flats)}
          </span>
        ))}
      </div>
      <Text nativeID={`${id}-hint`} variant="bodySmall" style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flex: 1, minWidth: 0 },
  value: { color: colors.gold },
  hint: { color: colors.muted },
});
