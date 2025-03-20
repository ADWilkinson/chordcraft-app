import { useState, useEffect, useCallback, useRef } from 'react';
import { Chord } from '../types';
import { initAudio, playProgression, stopAllAudio } from '../utils/audioUtils';
import { normalizeChords } from '../utils/chordUtils';

interface AudioPlayerState {
  isPlaying: boolean;
  currentChordIndex: number;
}

/**
 * Custom hook for audio playback of chord progressions
 */
export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentChordIndex: -1
  });
  
  const playerRef = useRef<{ stop: () => void; isPlaying: () => boolean } | null>(null);
  
  // Initialize audio on first mount
  useEffect(() => {
    initAudio().catch(err => {
      console.error('Failed to initialize audio:', err);
    });
    
    // Cleanup on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      stopAllAudio();
    };
  }, []);
  
  // Play a chord progression
  const play = useCallback((chords: Array<string | Chord>, tempo: number = 80) => {
    // Stop any previous playback
    if (playerRef.current) {
      playerRef.current.stop();
    }
    
    // Normalize the chords
    const normalizedChords = normalizeChords(chords);
    
    // Start playback
    const player = playProgression(
      normalizedChords,
      tempo,
      (index: number) => {
        setState({
          isPlaying: true,
          currentChordIndex: index
        });
      },
      () => {
        setState({
          isPlaying: false,
          currentChordIndex: -1
        });
        playerRef.current = null;
      }
    );
    
    // Store the player reference
    playerRef.current = player;
    
    // Update state
    setState({
      isPlaying: true,
      currentChordIndex: 0
    });
    
    return player;
  }, []);
  
  // Stop playback
  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
    stopAllAudio();
    setState({
      isPlaying: false,
      currentChordIndex: -1
    });
  }, []);
  
  // Toggle playback
  const toggle = useCallback((chords: Array<string | Chord>, tempo: number = 80) => {
    if (state.isPlaying) {
      stop();
    } else {
      play(chords, tempo);
    }
  }, [play, stop, state.isPlaying]);
  
  return {
    ...state,
    play,
    stop,
    toggle
  };
};