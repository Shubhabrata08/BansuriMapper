import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import MapperScreen from '../src/screens/MapperScreen';

jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.setTimeout(60000);

async function choose(field: string, value: string) {
  await fireEvent.press(screen.getByRole('button', { name: field }));
  await fireEvent.press(screen.getByRole('radio', { name: value }));
}

test('transposes independently, switches spelling, and resets through actual controls', async () => {
  await render(<MapperScreen />);
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('C4');
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('XXXOOO');
  await choose('Reference bansuri \u00b7 Sa', 'E bansuri \u00b7 Sa sounds E');
  expect(screen.getByTestId('selected-swar')).toHaveTextContent('Sa');
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('E4');
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('XOOOOO');
  await choose('Flute being mapped', 'F# bansuri \u00b7 Sa sounds F#');
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('E4');
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('XXXXHO');
  await fireEvent.press(screen.getByTestId('note-r'));
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('F4');
  await fireEvent.press(screen.getByRole('button', { name: 'Reset to C Bhairav' }));
  await fireEvent.press(screen.getByTestId('note-r'));
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('C#4');
  await fireEvent.press(screen.getByRole('radio', { name: 'Flats' }));
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('Db4');
  await fireEvent.press(screen.getByRole('button', { name: 'Reset to C Bhairav' }));
  expect(screen.getByTestId('selected-pitch')).toHaveTextContent('C4');
  expect(screen.getByRole('radio', { name: 'Sharps' })).toBeChecked();
});

test('alternate Pa updates both detail and row and clears when the thaat changes', async () => {
  await render(<MapperScreen />);
  expect(screen.queryByRole('switch', { name: 'Use alternate Pa fingering' })).toBeNull();
  await fireEvent.press(screen.getByTestId('note-P'));
  await fireEvent(screen.getByRole('switch', { name: 'Use alternate Pa fingering' }), 'valueChange', true);
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('OXXXXX');
  expect(screen.getByTestId('note-P').props.accessibilityLabel).toContain('OXXXXX');
  await choose('Reference bansuri \u00b7 Sa', 'C bansuri \u00b7 Sa sounds C');
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('OXXXXX');
  await choose('Thaat', 'Marwa');
  expect(screen.queryByTestId('note-P')).toBeNull();
  expect(screen.getByTestId('selected-swar')).toHaveTextContent('Sa');
  await choose('Thaat', 'Bhairav');
  await fireEvent.press(screen.getByTestId('note-P'));
  expect(screen.getByTestId('fingering-code')).toHaveTextContent('XXXXXX');
});

test('closing a choice dialog does not change settings', async () => {
  await render(<MapperScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Thaat' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Close Thaat' }));
  expect(screen.getByTestId('summary')).toHaveTextContent('Bhairav / C reference \u00b7 C flute');
  expect(screen.queryByRole('radio', { name: 'Marwa' })).toBeNull();
});

test('reference links open in the platform browser and report failures', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('No browser'));
  await render(<MapperScreen />);
  await fireEvent.press(screen.getByRole('link', { name: 'Six-hole bansuri swara chart' }));
  expect(open).toHaveBeenCalledWith('https://bikashacharya.com/sangeet-yatra/basuri/swaras.html');
  await fireEvent.press(screen.getByRole('link', { name: 'Interactive fingering chart' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The reference could not be opened. Please check that a browser is available.');
  open.mockRestore();
});
