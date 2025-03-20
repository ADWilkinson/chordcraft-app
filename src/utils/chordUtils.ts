import { Chord } from '../types';

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