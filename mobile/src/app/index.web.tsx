import type { Metadata } from 'expo-router/server';

export function generateMetadata(): Metadata {
  return {
    title: 'Bansuri Fingering Mapper',
    description: 'Map Hindustani swaras to six-hole bansuri fingerings. Choose a thaat, reference Sa, and flute key, with independent pitch and register guidance.',
  };
}

export { default } from '../screens/MapperScreen';
