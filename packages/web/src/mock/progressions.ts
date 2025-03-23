import { ChordProgression } from '../types';

export const mockProgressions: ChordProgression[] = [
  {
    id: '1',
    key: 'C',
    scale: 'major',
    mood: 'happy',
    style: 'pop',
    chords: [
      { name: 'C', notation: 'I', function: 'Tonic' },
      { name: 'G', notation: 'V', function: 'Dominant' },
      { name: 'Am', notation: 'vi', function: 'Relative minor' },
      { name: 'F', notation: 'IV', function: 'Subdominant' },
    ],
    insights: [
      'This is the classic "pop progression" used in countless hit songs',
      'The vi chord (Am) adds a touch of melancholy to an otherwise happy progression',
      'Moving from G to Am creates a smooth voice leading with minimal movement',
    ],
    createdAt: new Date('2025-03-19'),
    likes: 42,
    flags: 2,
  },
  {
    id: '2',
    key: 'A',
    scale: 'minor',
    mood: 'melancholic',
    style: 'rock',
    chords: [
      { name: 'Am', notation: 'i', function: 'Tonic' },
      { name: 'F', notation: 'VI', function: 'Submediant' },
      { name: 'C', notation: 'III', function: 'Mediant' },
      { name: 'G', notation: 'VII', function: 'Subtonic' },
    ],
    insights: [
      'This minor key progression creates a sense of emotional depth and introspection',
      'The descending bass line (A-F-C-G) creates a strong sense of movement',
      'This progression is commonly used in rock ballads and emotional songs',
    ],
    createdAt: new Date('2025-03-18'),
    likes: 37,
    flags: 1,
  },
  {
    id: '3',
    key: 'G',
    scale: 'major',
    mood: 'energetic',
    style: 'folk',
    chords: [
      { name: 'G', notation: 'I', function: 'Tonic' },
      { name: 'D', notation: 'V', function: 'Dominant' },
      { name: 'Em', notation: 'vi', function: 'Relative minor' },
      { name: 'C', notation: 'IV', function: 'Subdominant' },
    ],
    insights: [
      'This progression is perfect for strumming patterns and folk-style songs',
      'The G major key gives it a bright, open sound that works well with acoustic instruments',
      'Try using a capo to change the key while maintaining the same chord shapes',
    ],
    createdAt: new Date('2025-03-17'),
    likes: 28,
    flags: 0,
  },
];
