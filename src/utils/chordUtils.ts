import { Chord } from "../types";

/**
 * Type guard to check if a chord is in string format
 * @param chord - The chord to check
 * @returns True if the chord is a string
 */
export const isStringChord = (chord: string | Chord): chord is string => {
  return typeof chord === "string";
};

/**
 * Type guard to check if a chord is in object format
 * @param chord - The chord to check
 * @returns True if the chord is an object
 */
export const isChordObject = (chord: string | Chord): chord is Chord => {
  return typeof chord === "object" && chord !== null && "name" in chord;
};

/**
 * Extract a standardized chord name from various chord formats
 */
export const getChordName = (chord: string | Chord | { name: string }): string => {
  if (typeof chord === "string") {
    return chord;
  } else if (chord && typeof chord === "object") {
    return chord.name || "";
  }
  return "";
};

/**
 * Convert a string chord to a chord object
 * @param chord - The chord string to convert
 * @returns A chord object
 */
export const stringToChordObject = (chord: string): Chord => {
  return {
    name: chord,
    notation: chord,
  };
};

/**
 * Normalize chords to ensure they are in object format
 * @param chords - Array of chords in either string or object format
 * @returns Array of chords in object format
 */
export const normalizeChords = (chords: Array<string | Chord>): Chord[] => {
  return chords.map((chord) => (isStringChord(chord) ? stringToChordObject(chord) : chord));
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
 * Convert a chord name to an array of note names
 */
export const getChordNotes = (chordName: string): string[] => {
  if (!chordName) {
    console.warn("Empty chord name provided, defaulting to C major");
    return ["C4", "E4", "G4"];
  }

  // Parse the chord name to extract root and quality
  const { root, quality } = parseChord(chordName);

  // Base octave for different root notes to keep them in a reasonable range
  const baseOctave = getBaseOctave(root);

  // Define intervals for different chord types
  const intervals: Record<string, number[]> = {
    // Triads
    "": [0, 4, 7], // Major
    m: [0, 3, 7], // Minor
    dim: [0, 3, 6], // Diminished
    aug: [0, 4, 8], // Augmented
    sus2: [0, 2, 7], // Suspended 2nd
    sus4: [0, 5, 7], // Suspended 4th

    // Sevenths
    "7": [0, 4, 7, 10], // Dominant 7th
    maj7: [0, 4, 7, 11], // Major 7th
    m7: [0, 3, 7, 10], // Minor 7th
    dim7: [0, 3, 6, 9], // Diminished 7th
    m7b5: [0, 3, 6, 10], // Half-diminished 7th
    "7sus4": [0, 5, 7, 10], // Dominant 7th suspended 4th

    // Sixths
    "6": [0, 4, 7, 9], // Major 6th
    m6: [0, 3, 7, 9], // Minor 6th

    // Ninths
    "9": [0, 4, 7, 10, 14], // Dominant 9th
    maj9: [0, 4, 7, 11, 14], // Major 9th
    m9: [0, 3, 7, 10, 14], // Minor 9th

    // Others
    add9: [0, 4, 7, 14], // Add 9
    madd9: [0, 3, 7, 14], // Minor add 9
    "7b9": [0, 4, 7, 10, 13], // Dominant 7 flat 9
    "7#9": [0, 4, 7, 10, 15], // Dominant 7 sharp 9
    "13": [0, 4, 7, 10, 14, 21], // Dominant 13th (simplified)
  };

  // Get the intervals for the matched chord quality
  const matchedQuality = findMatchingChordQuality(quality, Object.keys(intervals));
  const chordIntervals = intervals[matchedQuality] || intervals[""];

  // Calculate the notes based on intervals
  const rootSemitone = noteToSemitone(root);
  if (rootSemitone === undefined) {
    console.warn(`Unknown root note: ${root}, defaulting to C`);
    return ["C4", "E4", "G4"];
  }

  return chordIntervals.map((interval) => {
    const noteSemitone = (rootSemitone + interval) % 12;
    const noteName = semitoneToNote(noteSemitone);
    const octave = baseOctave + Math.floor((rootSemitone + interval) / 12);
    return `${noteName}${octave}`;
  });
};

/**
 * Parse a chord name into root and quality
 */
export const parseChord = (name: string) => {
  // Extract the root note (C, C#, Db, etc.)
  let root = name.charAt(0).toUpperCase();
  let i = 1;

  // Check for sharp or flat
  if (i < name.length && (name.charAt(i) === "#" || name.charAt(i) === "b")) {
    root += name.charAt(i);
    i++;
  }

  // The rest is the chord quality
  const quality = name.substring(i);

  return { root, quality };
};

/**
 * Determine the base octave for a root note
 */
export const getBaseOctave = (rootNote: string): number => {
  const highOctaveNotes = ["C", "C#", "Db", "D", "D#", "Eb", "E"];
  return highOctaveNotes.includes(rootNote) ? 4 : 3;
};

/**
 * Map note name to semitone offset from C
 */
export const noteToSemitone = (note: string): number | undefined => {
  const mapping: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  return mapping[note];
};

/**
 * Convert semitone offset to note name
 */
export const semitoneToNote = (semitone: number): string => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return notes[semitone % 12];
};

/**
 * Find the best matching chord quality from available options
 */
export const findMatchingChordQuality = (quality: string, availableQualities: string[]): string => {
  // Try to find an exact match first
  if (availableQualities.includes(quality)) {
    return quality;
  }

  // Try to find a prefix match (e.g., "m7" should match "m")
  let matchedQuality = "";
  for (const q of availableQualities) {
    if (
      q !== "" &&
      quality.startsWith(q) &&
      (quality.length === q.length || !isNaN(parseInt(quality.charAt(q.length))))
    ) {
      if (q.length > matchedQuality.length) {
        matchedQuality = q;
      }
    }
  }

  // If no match found, default to major or minor
  if (!matchedQuality) {
    matchedQuality = quality.includes("m") && !quality.includes("maj") ? "m" : "";
  }

  return matchedQuality;
};

/**
 * Get notes in a specific key
 */
export const getKeyNotes = (key: string): string[] => {
  const { root } = parseChord(key);
  const rootSemitone = noteToSemitone(root) || 0;

  // Major scale intervals (whole, whole, half, whole, whole, whole, half)
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

  return majorScaleIntervals.map((interval) => {
    const noteSemitone = (rootSemitone + interval) % 12;
    return semitoneToNote(noteSemitone);
  });
};
