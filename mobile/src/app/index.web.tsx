import type { Metadata } from 'expo-router/server';

export function generateMetadata(): Metadata {
  return {
    title: 'Bansuri Fingering Mapper',
    description: 'Map Hindustani raga note sets to six-hole bansuri fingerings. Choose a raga, Reference Tanpura, and flute key, with independent pitch and register guidance.',
  };
}

export { default } from '../screens/MapperScreen';
