import * as Tone from 'tone';
import { Chord } from '../types';
import { getChordName, isStringChord } from './chordUtils';

// Initialize a polyphonic synth for chord playback
let synth: Tone.PolySynth | null = null;

// Create a reverb effect for a richer sound
let reverb: Tone.Reverb | null = null;

// Audio engine state
let isInitialized = false;

/**
 * Initialize the audio engine
 * Must be called from a user action
 */
export const initAudio = async (): Promise<void> => {
  // Only initialize once
  if (isInitialized) return;
  
  try {
    // Start the audio context (must be called from a user action)
    await Tone.start();
    
    // Create a polyphonic synth with FMSynth as the base
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Configure the synth for a pleasant sound
    synth.set({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    });
    
    // Create a reverb effect
    reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2
    }).toDestination();
    
    // Connect the synth to the reverb
    synth.connect(reverb);
    
    // Set a reasonable volume
    Tone.getDestination().volume.value = -10;
    
    isInitialized = true;
    console.log('Tone.js audio engine initialized');
  } catch (error) {
    console.error('Failed to initialize audio engine:', error);
    throw error;
  }
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
const CHORD_TYPES: { [key: string]: number[] } = {
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
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert a chord name to an array of notes in Tone.js format
 */
export const getChordNotes = (chordName: string, octave = 4): string[] => {
  const { root, type } = parseChord(chordName);
  
  // Get the intervals for this chord type
  const intervals = CHORD_TYPES[type] || CHORD_TYPES[''];
  
  // Find the index of the root note
  const rootIndex = NOTE_NAMES.indexOf(root);
  if (rootIndex === -1) return [`C${octave}`, `E${octave}`, `G${octave}`]; // Default to C major
  
  // Calculate the notes based on intervals
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return `${NOTE_NAMES[noteIndex]}${noteOctave}`;
  });
};

/**
 * Play a single chord
 */
export const playChord = (chordName: string, duration = '2n', time = Tone.now()): void => {
  if (!synth) {
    console.warn('Audio engine not initialized. Call initAudio() first.');
    return;
  }
  
  const notes = getChordNotes(chordName);
  synth.triggerAttackRelease(notes, duration, time);
};

/**
 * Play a progression of chords with a specified tempo
 */
export const playProgression = (
  chords: Array<string | Chord>,
  tempo = 80, // BPM
  onChordChange?: (index: number) => void,
  onComplete?: () => void
): { stop: () => void; isPlaying: () => boolean } => {
  if (!synth) {
    console.warn('Audio engine not initialized. Call initAudio() first.');
    return { 
      stop: () => {},
      isPlaying: () => false
    };
  }
  
  // Stop any previous playback
  stopAllAudio();
  
  // Get the transport
  const transport = Tone.getTransport();
  
  // Set the tempo
  transport.bpm.value = tempo;
  
  // Calculate duration in seconds based on tempo
  const beatDuration = 60 / tempo;
  const chordDuration = beatDuration * 2; // Each chord lasts 2 beats
  
  // Schedule all chords
  const events: number[] = [];
  let isActive = true;
  
  // Reset transport position
  transport.position = 0;
  
  // Use Tone.js scheduling for more precise timing
  chords.forEach((chord, index) => {
    const startTime = index * chordDuration;
    const chordName = getChordName(chord);
    const notes = getChordNotes(chordName);
    
    // Schedule the chord using Transport
    const eventId = transport.schedule(() => {
      if (isActive) {
        // Play the chord
        synth?.triggerAttackRelease(notes, `${chordDuration}s`, Tone.now());
        
        // Call the chord change callback
        if (onChordChange) {
          onChordChange(index);
        }
      }
    }, `+${startTime}`);
    
    events.push(eventId);
  });
  
  // Schedule completion callback
  if (onComplete) {
    const totalDuration = chords.length * chordDuration;
    const eventId = transport.schedule(() => {
      if (isActive) {
        onComplete();
        // Stop the transport when complete
        transport.stop();
      }
    }, `+${totalDuration + 0.1}`); // Add a small buffer
    
    events.push(eventId);
  }
  
  // Start the transport
  transport.start();
  
  // Return a function to stop the progression
  return {
    stop: () => {
      // Mark as inactive
      isActive = false;
      
      // Stop the transport
      transport.stop();
      
      // Cancel all scheduled events
      events.forEach(id => transport.clear(id));
      
      // Stop all audio
      stopAllAudio();
    },
    isPlaying: () => isActive
  };
};

/**
 * Stop all audio immediately
 */
export const stopAllAudio = (): void => {
  if (synth) {
    // Cancel any scheduled events
    const transport = Tone.getTransport();
    transport.cancel();
    
    // Release all notes
    synth.releaseAll();
    
    // Reset the transport time
    transport.position = 0;
  }
};
