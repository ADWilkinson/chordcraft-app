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
  
  // Try to initialize audio on first user interaction
  // We'll track whether we've attempted initialization
  const initAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      console.log('AudioPlayer unmounting, cleaning up');
      if (playerRef.current) {
        playerRef.current.stop();
      }
      stopAllAudio();
    };
  }, []);
  
  // Play a chord progression
  const play = useCallback(async (chords: Array<string | Chord>, tempo: number = 80) => {
    console.log('useAudioPlayer.play called with', { chordsLength: chords.length, tempo });
    initAttemptedRef.current = true;
    
    try {
      // Initialize audio first (this needs user interaction)
      console.log('Initializing audio...');
      await initAudio();
      console.log('Audio initialized successfully');
      
      // Stop any previous playback
      if (playerRef.current) {
        console.log('Stopping previous playback');
        playerRef.current.stop();
        playerRef.current = null;
      }
      
      // Normalize the chords
      console.log('Normalizing chords');
      const normalizedChords = normalizeChords(chords);
      console.log('Normalized chords:', normalizedChords);
      
      // Validate that we have valid chords to play
      if (!normalizedChords.length) {
        console.warn('No valid chords to play');
        return {
          stop: () => {},
          isPlaying: () => false
        };
      }
      
      // Start playback
      console.log('Starting playback...');
      const player = playProgression(
        normalizedChords,
        tempo,
        (index: number) => {
          console.log('Chord changed to index:', index);
          setState({
            isPlaying: true,
            currentChordIndex: index
          });
        },
        () => {
          console.log('Playback completed');
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
      
      console.log('Playback started successfully');
      return player;
    } catch (error) {
      console.error('Failed to initialize audio or play progression:', error);
      setState({
        isPlaying: false,
        currentChordIndex: -1
      });
      return {
        stop: () => {},
        isPlaying: () => false
      };
    }
  }, []);
  
  // Stop playback
  const stop = useCallback(() => {
    console.log('useAudioPlayer.stop called');
    
    try {
      // Stop current player if exists
      if (playerRef.current) {
        console.log('Stopping current player');
        playerRef.current.stop();
        playerRef.current = null;
      } else {
        console.log('No player to stop');
      }
      
      // Make sure all audio is stopped
      console.log('Stopping all audio');
      stopAllAudio();
      
      // Update state
      console.log('Resetting audio player state');
      setState({
        isPlaying: false,
        currentChordIndex: -1
      });
    } catch (error) {
      console.error('Error stopping playback:', error);
      // Force reset state even if there was an error
      setState({
        isPlaying: false,
        currentChordIndex: -1
      });
    }
  }, []);
  
  // Toggle playback
  const toggle = useCallback(async (chords: Array<string | Chord>, tempo: number = 80) => {
    console.log('useAudioPlayer.toggle called, isPlaying:', state.isPlaying);
    
    if (state.isPlaying) {
      console.log('Currently playing, stopping playback');
      stop();
    } else {
      console.log('Not playing, starting playback');
      try {
        await play(chords, tempo);
        console.log('Play completed successfully from toggle');
      } catch (error) {
        console.error('Error in toggle -> play:', error);
      }
    }
  }, [play, stop, state.isPlaying]);
  
  return {
    ...state,
    play,
    stop,
    toggle
  };
};