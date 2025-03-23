import { Chord } from '../../types/music';
import { getChordName } from '../chordUtils';

// Audio engine state
let isInitialized = false;
let soundPlayers: Record<string, any> = {};
// let activePlayer: any = null;

// Try to dynamically import the Expo Audio module (will fail on web)
let Audio: any = null;
try {
  // This will be replaced by the actual module in React Native
  Audio = { 
    Sound: { 
      createAsync: async () => ({ sound: null }), 
      setStatusAsync: async () => ({}) 
    },
    setAudioModeAsync: async () => ({})
  };
} catch (error) {
  console.error('Error importing Audio:', error);
}

/**
 * Initialize the audio engine
 */
export const initAudio = async (): Promise<void> => {
  try {
    // Check if we need to initialize
    if (isInitialized) {
      console.log('Audio already initialized');
      return;
    }

    console.log('Initializing mobile audio...');
    
    try {
      // Dynamically import Expo Audio on mobile
      try {
        Audio = require('expo-av');
      } catch (importError) {
        console.error('Error importing expo-av:', importError);
        // Continue with mock Audio for development
      }
      
      // Configure audio mode
      if (Audio && Audio.setAudioModeAsync) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });
      }
      
      isInitialized = true;
      console.log('Mobile audio initialized successfully');
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
 * Play a single chord
 */
export const playChord = async (
  chordName: string, 
  duration: number = 1
): Promise<void> => {
  if (!isInitialized || !Audio || !Audio.Sound) {
    console.warn('Audio engine not initialized. Call initAudio() first.');
    return;
  }
  
  try {
    // For mobile, we'll use a dummy sound for now
    // In a real implementation, you would load chord sound files
    // const soundFile = require('../../../assets/sounds/beep.mp3');
    const soundFile = { uri: 'https://example.com/beep.mp3' };
    
    // Create or reuse the sound player
    if (!soundPlayers[chordName]) {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      soundPlayers[chordName] = sound;
    }
    
    const player = soundPlayers[chordName];
    
    // Play the sound
    await player.playFromPositionAsync(0);
    
    // Stop after duration
    setTimeout(async () => {
      await player.stopAsync();
    }, duration * 1000);
  } catch (error) {
    console.error(`Error playing chord ${chordName}:`, error);
  }
};

/**
 * Play a progression of chords with a specified tempo
 */
export const playProgression = async (
  chords: Array<string | Chord>,
  tempo: number = 80, // BPM
  onChordChange?: (index: number) => void,
  onComplete?: () => void
): Promise<{ stop: () => Promise<void>; isPlaying: () => boolean }> => {
  if (!isInitialized || !Audio || !Audio.Sound) {
    console.warn('Audio engine not initialized. Call initAudio() first.');
    return { 
      stop: async () => {},
      isPlaying: () => false
    };
  }
  
  // If there are no chords, just return
  if (!chords || chords.length === 0) {
    console.warn('No chords provided for playback.');
    if (onComplete) onComplete();
    return {
      stop: async () => {},
      isPlaying: () => false
    };
  }
  
  try {
    // Stop any previous playback
    await stopAllAudio();
    
    // Calculate duration in milliseconds based on tempo
    const beatDuration = 60 / tempo * 1000; // Convert to ms
    const chordDuration = beatDuration * 2; // Each chord lasts 2 beats
    
    let isActive = true;
    let currentIndex = 0;
    
    // Function to play the next chord
    const playNextChord = async () => {
      if (!isActive || currentIndex >= chords.length) {
        if (isActive && onComplete) onComplete();
        isActive = false;
        return;
      }
      
      const chord = chords[currentIndex];
      const chordName = getChordName(chord);
      
      // Notify about chord change
      if (onChordChange) onChordChange(currentIndex);
      
      // Play the chord
      await playChord(chordName, chordDuration / 1000);
      
      // Schedule the next chord
      currentIndex++;
      if (isActive) {
        setTimeout(playNextChord, chordDuration);
      }
    };
    
    // Start playback
    playNextChord();
    
    // Return controls
    return {
      stop: async () => {
        isActive = false;
        await stopAllAudio();
      },
      isPlaying: () => isActive
    };
  } catch (error) {
    console.error('Error playing progression:', error);
    return {
      stop: async () => {},
      isPlaying: () => false
    };
  }
};

/**
 * Stop all audio immediately
 */
export const stopAllAudio = async (): Promise<void> => {
  if (!isInitialized) return;
  
  try {
    // Stop all sound players
    for (const key in soundPlayers) {
      if (soundPlayers[key]) {
        await soundPlayers[key].stopAsync();
      }
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};