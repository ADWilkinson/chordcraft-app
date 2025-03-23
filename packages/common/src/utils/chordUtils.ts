import { Chord } from '../types/music';

/**
 * Get the notes for a chord based on chord name
 * @param chordName - The name of the chord
 * @returns Array of note names
 */
export const getChordNotes = (chordName: string): string[] => {
  const { root, type } = parseChord(chordName);
  const rootIndex = NOTE_NAMES.indexOf(root);
  
  if (rootIndex === -1) {
    console.warn(`Invalid root note: ${root}`);
    return [];
  }
  
  const intervals = CHORD_TYPES[type] || CHORD_TYPES[''];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTE_NAMES[noteIndex];
  });
};

/**
 * Type guard to check if a chord is in string format
 * @param chord - The chord to check
 * @returns True if the chord is a string
 */
export const isStringChord = (chord: string | Chord): chord is string => {
  return typeof chord === 'string';
};

/**
 * Type guard to check if a chord is in object format
 * @param chord - The chord to check
 * @returns True if the chord is an object
 */
export const isChordObject = (chord: string | Chord): chord is Chord => {
  return typeof chord === 'object' && chord !== null && 'name' in chord;
};

/**
 * Get the name of a chord regardless of format
 * @param chord - The chord (string or object with name property)
 * @returns The chord name
 */
export const getChordName = (chord: string | Chord | { name: string }): string => {
  if (typeof chord === 'string') {
    return chord;
  }
  return chord.name;
};

/**
 * Convert a string chord to a chord object
 * @param chord - The chord string to convert
 * @returns A chord object
 */
export const stringToChordObject = (chord: string): Chord => {
  return {
    name: chord,
    notation: chord
  };
};

/**
 * Normalize chords to ensure they are in object format
 * @param chords - Array of chords in either string or object format
 * @returns Array of chords in object format
 */
export const normalizeChords = (chords: Array<string | Chord>): Chord[] => {
  return chords.map(chord => (isStringChord(chord) ? stringToChordObject(chord) : chord));
};

/**
 * Extract chord names from an array of chords (mixed format)
 * @param chords - Array of chords in either string or object format
 * @returns Array of chord names as strings
 */
export const extractChordNames = (chords: Array<string | Chord>): string[] => {
  return chords.map(getChordName);
};

/**
 * Parse a chord name to get the root note and type
 */
export const parseChord = (chordName: string): { root: string; type: string } => {
  // Handle special case for power chords
  if (chordName.endsWith('5')) {
    return { root: chordName.slice(0, -1), type: '5' };
  }
  
  // Match root note (with optional sharp/flat) and chord type
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    return { root: match[1], type: match[2] };
  }
  return { root: 'C', type: '' }; // Default to C major if parsing fails
};

// Mapping of chord types to intervals
export const CHORD_TYPES: { [key: string]: number[] } = {
  '': [0, 4, 7], // Major
  'maj': [0, 4, 7], // Major
  'm': [0, 3, 7], // Minor
  'min': [0, 3, 7], // Minor
  'dim': [0, 3, 6], // Diminished
  'aug': [0, 4, 8], // Augmented
  '7': [0, 4, 7, 10], // Dominant 7th
  'maj7': [0, 4, 7, 11], // Major 7th
  'm7': [0, 3, 7, 10], // Minor 7th
  'dim7': [0, 3, 6, 9], // Diminished 7th
  'sus2': [0, 2, 7], // Suspended 2nd
  'sus4': [0, 5, 7], // Suspended 4th
  'add9': [0, 4, 7, 14], // Add 9th
  '6': [0, 4, 7, 9], // Major 6th
  'm6': [0, 3, 7, 9], // Minor 6th
  '9': [0, 4, 7, 10, 14], // Dominant 9th
  'maj9': [0, 4, 7, 11, 14], // Major 9th
  'm9': [0, 3, 7, 10, 14], // Minor 9th
  '5': [0, 7], // Power chord
};

// Note names for calculating chord notes
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];