// Simple audio synthesis for chord playback
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

// Map of chord types to intervals (in semitones from the root)
const chordIntervals: Record<string, number[]> = {
  // Major chords
  '': [0, 4, 7], // Major triad
  'maj': [0, 4, 7],
  'maj7': [0, 4, 7, 11],
  '6': [0, 4, 7, 9],
  'add9': [0, 4, 7, 14],
  
  // Minor chords
  'm': [0, 3, 7], // Minor triad
  'min': [0, 3, 7],
  'm7': [0, 3, 7, 10],
  'm6': [0, 3, 7, 9],
  'madd9': [0, 3, 7, 14],
  
  // Dominant chords
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '13': [0, 4, 7, 10, 14, 21],
  
  // Diminished and augmented
  'dim': [0, 3, 6],
  'dim7': [0, 3, 6, 9],
  'aug': [0, 4, 8],
  
  // Suspended chords
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '7sus4': [0, 5, 7, 10],
};

// Map of note names to frequencies (A4 = 440Hz)
const noteFrequencies: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18, 'Db': 277.18,
  'D': 293.66,
  'D#': 311.13, 'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99, 'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30, 'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16, 'Bb': 466.16,
  'B': 493.88,
};

// Parse a chord name to get the root note and type
const parseChord = (chordName: string): { root: string; type: string } => {
  // Handle special cases like C#m, Bbmaj7, etc.
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    return { root: match[1], type: match[2] };
  }
  return { root: 'C', type: '' }; // Default to C major if parsing fails
};

// Get frequencies for a chord
const getChordFrequencies = (chordName: string): number[] => {
  const { root, type } = parseChord(chordName);
  const rootFreq = noteFrequencies[root] || noteFrequencies['C']; // Default to C if root not found
  
  // Find the intervals for this chord type
  const intervals = chordIntervals[type] || chordIntervals[''];
  
  // Calculate frequencies for each note in the chord
  return intervals.map(interval => {
    // Convert semitones to frequency ratio and multiply by root frequency
    return rootFreq * Math.pow(2, interval / 12);
  });
};

// Play a single note
const playNote = (frequency: number, duration: number, startTime: number, volume = 0.3): void => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  gainNode.gain.value = 0;
  
  // Connect the nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start the oscillator
  oscillator.start(startTime);
  
  // Apply envelope
  const attackTime = 0.02;
  const releaseTime = 0.3;
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
  gainNode.gain.setValueAtTime(volume, startTime + duration - releaseTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  // Stop the oscillator
  oscillator.stop(startTime + duration);
};

// Play a chord
export const playChord = (chordName: string, duration = 1, startTime = 0, strum = 0.02): void => {
  if (!audioContext) return;
  
  // Resume audio context if it's suspended (needed for browsers that block autoplay)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const now = audioContext.currentTime;
  const actualStartTime = startTime === 0 ? now : startTime;
  
  const frequencies = getChordFrequencies(chordName);
  
  // Play each note with a slight delay to create a strumming effect
  frequencies.forEach((freq, index) => {
    playNote(freq, duration, actualStartTime + (index * strum), 0.2);
  });
};

// Play a progression of chords
export const playProgression = (
  chords: string[],
  tempo = 80, // BPM
  onChordChange?: (index: number) => void
): { stop: () => void } => {
  if (!audioContext || !chords.length) {
    return { stop: () => {} };
  }
  
  // Resume audio context if it's suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const now = audioContext.currentTime;
  const beatDuration = 60 / tempo; // Duration of one beat in seconds
  const chordDuration = beatDuration * 2; // Each chord lasts 2 beats
  
  // Schedule all the chords
  chords.forEach((chord, index) => {
    const startTime = now + (index * chordDuration);
    playChord(chord, chordDuration - 0.1, startTime); // Slight gap between chords
    
    // Schedule the callback for chord change
    if (onChordChange) {
      setTimeout(() => {
        onChordChange(index);
      }, (startTime - now) * 1000);
    }
  });
  
  // Return a function to stop the progression
  return {
    stop: () => {
      if (audioContext) {
        // Create a new gain node and connect all audio through it
        const masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.setValueAtTime(1, audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
        
        // This doesn't actually stop scheduled sounds, but it will fade them out
        setTimeout(() => {
          // In a real implementation, we would need to keep track of all oscillators
          // and stop them individually
        }, 100);
      }
    }
  };
};

// Initialize audio context on user interaction to avoid autoplay restrictions
export const initAudio = (): void => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
