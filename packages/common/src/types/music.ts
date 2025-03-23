/**
 * Music key with display name and value
 */
export interface MusicKey {
  name: string;
  value: string;
}

/**
 * Music scale with display name and value
 */
export interface MusicScale {
  name: string;
  value: string;
}

/**
 * Music mood with display name and value
 */
export interface MusicMood {
  name: string;
  value: string;
}

/**
 * Music style with display name and value
 */
export interface MusicStyle {
  name: string;
  value: string;
}

/**
 * Chord representation
 */
export interface Chord {
  name: string;
  notation: string;
  function?: string;
}

/**
 * Parameters for generating a new chord progression
 */
export interface GenerationParams {
  key?: string;
  scale?: string;
  startingChord?: string;
  mood?: string;
  style?: string;
}