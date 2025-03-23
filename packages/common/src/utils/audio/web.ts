import * as Tone from 'tone';
import { Chord } from '../../types/music';
import { getChordName, parseChord, CHORD_TYPES, NOTE_NAMES } from '../chordUtils';

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
  try {
    // Check if we need to initialize
    if (isInitialized && synth) {
      console.log('Audio already initialized');
      return;
    }
    
    console.log('Starting Tone.js audio context...');
    
    // Ensure we're in a secure context
    if (window.isSecureContext) {
      console.log('Running in secure context (good for audio)');
    } else {
      console.warn('Not running in secure context, audio may not work');
    }
    
    // Handle browser autoplay policies
    console.log('AudioContext state before:', Tone.context.state);
    
    try {
      // Try to resume the audio context if it's suspended
      if (Tone.context.state === 'suspended') {
        console.log('Resuming suspended audio context');
        await Tone.context.resume();
      }
      
      // This call is critical for satisfying browser autoplay policies
      // It needs to happen in direct response to a user action
      await Tone.start();
      console.log('Tone.start() completed successfully');
      console.log('AudioContext state after:', Tone.context.state);
    } catch (contextError) {
      console.error('Error starting audio context:', contextError);
      throw contextError;
    }
    
    // Create audio components
    try {
      // Create a polyphonic synth if needed
      if (!synth) {
        console.log('Creating synth...');
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
        console.log('Synth created successfully');
      }
      
      // Create a reverb effect if needed
      if (!reverb) {
        console.log('Creating reverb...');
        reverb = new Tone.Reverb({
          decay: 1.5,
          wet: 0.2
        }).toDestination();
        
        // Connect the synth to the reverb
        synth.connect(reverb);
        console.log('Reverb created and connected');
      }
      
      // Set a reasonable volume
      Tone.getDestination().volume.value = -10;
      console.log('Volume set');
      
      // Try to play a silent note to ensure audio is working
      try {
        console.log('Testing audio with a silent note');
        const now = Tone.now();
        synth.triggerAttackRelease(['C4'], 0.01, now, 0.01); // Very quiet, short test
        console.log('Test note played successfully');
      } catch (testError) {
        console.warn('Error playing test note:', testError);
        // Continue anyway, it might work for real playback
      }
      
      isInitialized = true;
      console.log('Tone.js audio engine initialized successfully');
    } catch (setupError) {
      console.error('Error setting up audio components:', setupError);
      throw setupError;
    }
  } catch (error) {
    console.error('Failed to initialize audio engine:', error);
    // Reset state so we can try again
    isInitialized = false;
    throw error;
  }
};

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
  if (!synth || !isInitialized) {
    console.warn('Audio engine not initialized. Call initAudio() first.');
    return { 
      stop: () => {},
      isPlaying: () => false
    };
  }
  
  // If there are no chords, just return
  if (!chords || chords.length === 0) {
    console.warn('No chords provided for playback.');
    return {
      stop: () => {},
      isPlaying: () => false
    };
  }
  
  try {
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
      // Skip any invalid chords
      if (!chord) return;
      
      const startTime = index * chordDuration;
      const chordName = getChordName(chord);
      
      // Skip if no chord name is available
      if (!chordName) return;
      
      const notes = getChordNotes(chordName);
      
      // Schedule the chord using Transport
      const eventId = transport.schedule(() => {
        if (isActive && synth) {
          // Play the chord
          try {
            synth.triggerAttackRelease(notes, `${chordDuration}s`, Tone.now());
          } catch (error) {
            console.error(`Error playing chord ${chordName}:`, error);
          }
          
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
        
        try {
          // Stop the transport
          transport.stop();
          
          // Cancel all scheduled events
          events.forEach(id => transport.clear(id));
          
          // Stop all audio
          stopAllAudio();
        } catch (error) {
          console.error('Error stopping playback:', error);
        }
      },
      isPlaying: () => isActive
    };
  } catch (error) {
    console.error('Error playing progression:', error);
    return {
      stop: () => {},
      isPlaying: () => false
    };
  }
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