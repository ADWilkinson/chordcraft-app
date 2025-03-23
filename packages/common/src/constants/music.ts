import { MusicKey, MusicScale, MusicMood, MusicStyle } from '../types/music';

export const KEYS: MusicKey[] = [
  { name: 'C', value: 'C' },
  { name: 'C#/Db', value: 'C#' },
  { name: 'D', value: 'D' },
  { name: 'D#/Eb', value: 'Eb' },
  { name: 'E', value: 'E' },
  { name: 'F', value: 'F' },
  { name: 'F#/Gb', value: 'F#' },
  { name: 'G', value: 'G' },
  { name: 'G#/Ab', value: 'Ab' },
  { name: 'A', value: 'A' },
  { name: 'A#/Bb', value: 'Bb' },
  { name: 'B', value: 'B' },
];

export const SCALES: MusicScale[] = [
  { name: 'Major', value: 'major' },
  { name: 'Minor', value: 'minor' },
  { name: 'Dorian', value: 'dorian' },
  { name: 'Phrygian', value: 'phrygian' },
  { name: 'Lydian', value: 'lydian' },
  { name: 'Mixolydian', value: 'mixolydian' },
  { name: 'Locrian', value: 'locrian' },
  { name: 'Harmonic Minor', value: 'harmonic_minor' },
  { name: 'Melodic Minor', value: 'melodic_minor' },
];

export const MOODS: MusicMood[] = [
  { name: 'Happy', value: 'happy' },
  { name: 'Sad', value: 'sad' },
  { name: 'Melancholic', value: 'melancholic' },
  { name: 'Energetic', value: 'energetic' },
  { name: 'Relaxed', value: 'relaxed' },
  { name: 'Tense', value: 'tense' },
  { name: 'Dreamy', value: 'dreamy' },
  { name: 'Epic', value: 'epic' },
  { name: 'Romantic', value: 'romantic' },
];

export const STYLES: MusicStyle[] = [
  { name: 'Pop', value: 'pop' },
  { name: 'Rock', value: 'rock' },
  { name: 'Jazz', value: 'jazz' },
  { name: 'Classical', value: 'classical' },
  { name: 'Electronic', value: 'electronic' },
  { name: 'Folk', value: 'folk' },
  { name: 'R&B', value: 'rnb' },
  { name: 'Hip Hop', value: 'hiphop' },
  { name: 'Country', value: 'country' },
  { name: 'Blues', value: 'blues' },
];