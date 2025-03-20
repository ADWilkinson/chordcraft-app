import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Chord } from '../types';
import { getChordName } from '../utils/chordUtils';
import * as Tone from 'tone';

interface ProgressionPlayerProps {
  chords: Array<string | Chord | { name: string }>;
  tempo?: number; // in BPM
}

const ProgressionPlayer = ({ 
  chords, 
  tempo = 80
}: ProgressionPlayerProps) => {
  const [tempoValue, setTempoValue] = useState(tempo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const transportIdRef = useRef<number[]>([]);
  
  // Use a ref to track if playback should continue
  const isPlayingRef = useRef(false);
  // Use a ref to track the current setTimeout ID for the next chord
  const currentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset playback when chords change
  useEffect(() => {
    if (isPlaying) {
      stopPlayback();
    }
  }, [chords]);

  // Play a single chord and schedule the next one
  const playChord = async (index: number) => {
    // If we're not supposed to be playing or we've reached the end, stop
    if (!isPlayingRef.current || index >= chords.length) {
      if (index >= chords.length) {
        console.log('Reached end of progression');
      }
      stopPlayback();
      return;
    }
    
    try {
      // Make sure we have a synth
      if (!synthRef.current) {
        console.log('No synth available');
        stopPlayback();
        return;
      }
      
      // Get the chord to play
      const chord = chords[index];
      const chordName = getChordName(chord);
      console.log(`Playing chord ${index}: ${chordName}`);
      
      // Update UI to show the current chord
      setCurrentChordIndex(index);
      
      // Calculate how long to play each chord
      const beatDuration = 60 / tempoValue;
      const chordDuration = beatDuration * 2; // Each chord lasts 2 beats
      
      // Get the notes to play
      const notes = getNotes(chordName);
      console.log('Playing notes:', notes);
      
      // Actually play the notes
      synthRef.current.triggerAttackRelease(notes, chordDuration * 0.8);
      
      // Schedule the next chord
      currentTimeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          playChord(index + 1);
        }
      }, chordDuration * 1000) as unknown as NodeJS.Timeout;
      
    } catch (error) {
      console.error('Error playing chord:', error);
      stopPlayback();
    }
  };

  // Start audio playback
  const startPlayback = async () => {
    try {
      console.log('Starting playback...');
      
      // First make sure we're not already playing
      stopPlayback();
      
      // Set our flag to indicate we should be playing
      isPlayingRef.current = true;
      
      // Initialize Tone.js audio context (browser requirement)
      console.log('Initializing Tone.js...');
      await Tone.start();
      
      // Resume audio context if it's suspended
      if (Tone.context.state !== 'running') {
        console.log('Audio context not running, resuming...');
        await Tone.context.resume();
      }
      
      // Initialize synth if needed
      if (!synthRef.current) {
        console.log('Creating new synth...');
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synthRef.current.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
        });
        
        // Set a reasonable volume
        Tone.getDestination().volume.value = -3;
      }
      
      // Set state to playing before we start
      setIsPlaying(true);
      
      // Start with the first chord - this will recursively schedule the rest
      console.log('Starting chord sequence...');
      await playChord(0);
      
    } catch (error) {
      console.error('Failed to start playback:', error);
      stopPlayback();
    }
  };
  
  // Helper function to get chord notes
  const getNotes = (chordName: string) => {
    // Handle empty string or null
    if (!chordName) {
      console.warn('Empty chord name provided, defaulting to C major');
      return ['C4', 'E4', 'G4'];
    }
    
    console.log(`Getting notes for chord: "${chordName}"`);
    
    // Map chord names to notes
    const chordMap: Record<string, string[]> = {
      // Major chords
      'C': ['C4', 'E4', 'G4'],
      'C#': ['C#4', 'F4', 'G#4'],
      'Db': ['Db4', 'F4', 'Ab4'],
      'D': ['D4', 'F#4', 'A4'],
      'D#': ['D#4', 'G4', 'A#4'],
      'Eb': ['Eb4', 'G4', 'Bb4'],
      'E': ['E4', 'G#4', 'B4'],
      'F': ['F4', 'A4', 'C5'],
      'F#': ['F#4', 'A#4', 'C#5'],
      'Gb': ['Gb4', 'Bb4', 'Db5'],
      'G': ['G3', 'B3', 'D4'],
      'G#': ['G#3', 'C4', 'D#4'],
      'Ab': ['Ab3', 'C4', 'Eb4'],
      'A': ['A3', 'C#4', 'E4'],
      'A#': ['A#3', 'D4', 'F4'],
      'Bb': ['Bb3', 'D4', 'F4'],
      'B': ['B3', 'D#4', 'F#4'],
      
      // Minor chords (add 'm' suffix)
      'Cm': ['C4', 'Eb4', 'G4'],
      'C#m': ['C#4', 'E4', 'G#4'],
      'Dbm': ['Db4', 'E4', 'Ab4'],
      'Dm': ['D4', 'F4', 'A4'],
      'D#m': ['D#4', 'F#4', 'A#4'],
      'Ebm': ['Eb4', 'Gb4', 'Bb4'],
      'Em': ['E4', 'G4', 'B4'],
      'Fm': ['F4', 'Ab4', 'C5'],
      'F#m': ['F#4', 'A4', 'C#5'],
      'Gbm': ['Gb4', 'A4', 'Db5'],
      'Gm': ['G3', 'Bb3', 'D4'],
      'G#m': ['G#3', 'B3', 'D#4'],
      'Abm': ['Ab3', 'B3', 'Eb4'],
      'Am': ['A3', 'C4', 'E4'],
      'A#m': ['A#3', 'C#4', 'F4'],
      'Bbm': ['Bb3', 'Db4', 'F4'],
      'Bm': ['B3', 'D4', 'F#4'],
    };
    
    // Try to match the full chord name
    if (chordMap[chordName]) {
      return chordMap[chordName];
    }
    
    // Simplify the chord name to just the root note
    const root = chordName.charAt(0).toUpperCase() + (chordName.charAt(1) === '#' || chordName.charAt(1) === 'b' ? chordName.charAt(1) : '');
    const isMinor = chordName.includes('m') && !chordName.includes('maj');
    
    // Get the root chord with or without 'm' suffix
    const simpleChordName = isMinor ? root + 'm' : root;
    
    if (chordMap[simpleChordName]) {
      return chordMap[simpleChordName];
    }
    
    // Default to C major if we can't figure it out
    return ['C4', 'E4', 'G4'];
  };
  
  const stopPlayback = () => {
    try {
      console.log('Stopping playback');
      
      // Set our control flag to stop future chord scheduling
      isPlayingRef.current = false;
      
      // Clear the current timeout if it exists
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
        currentTimeoutRef.current = null;
      }
      
      // Clear any other timeouts
      transportIdRef.current.forEach(id => {
        clearTimeout(id);
      });
      transportIdRef.current = [];
      
      // Stop any Tone.js transport events
      Tone.Transport.cancel();
      Tone.Transport.stop();
      
      // Release all notes
      if (synthRef.current) {
        console.log('Releasing all notes');
        synthRef.current.releaseAll();
      }
      
      // Update state
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      console.log('Playback stopped successfully');
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const handleTogglePlayback = async () => {
    try {
      console.log('Toggle playback button clicked');
      
      // Use isPlaying state to determine what to do
      if (isPlaying) {
        console.log('Currently playing, stopping playback');
        stopPlayback();
      } else {
        console.log('Currently stopped, starting playback');
        // Make sure we start fresh
        isPlayingRef.current = true;
        await startPlayback();
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      // In case of error, make sure we're in a clean state
      stopPlayback();
    }
  };

  const handleRestart = async () => {
    try {
      console.log('Restart button clicked');
      
      // Stop any current playback and wait a moment to ensure cleanup
      stopPlayback();
      
      // Small delay to ensure proper cleanup before starting again
      setTimeout(async () => {
        // Make sure we start fresh
        isPlayingRef.current = true;
        
        // Start playback from the beginning
        await startPlayback();
      }, 100);
    } catch (error) {
      console.error('Failed to restart playback:', error);
      stopPlayback();
    }
  };

  const decreaseTempo = () => {
    setTempoValue(Math.max(60, tempoValue - 5));
  };

  const increaseTempo = () => {
    setTempoValue(Math.min(180, tempoValue + 5));
  };

  // Keeping this function in case we need to re-enable the slider
  // const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setTempoValue(Number(e.target.value));
  // };

  return (
    <div className="w-full bg-gradient-to-r from-[#e5d8ce] to-[#e5d8ce]/80 rounded-md border border-[#877a74]/30 py-2 px-3 mb-1.5">
      <div className="flex items-center mb-2 w-full">
        {/* Controls group */}
        <div className="flex items-center space-x-2">
          {/* Play/Pause button */}
          <button
            onClick={handleTogglePlayback}
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#49363b] text-[#e5d8ce] hover:bg-[#3e2e32] shadow-sm transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="h-3.5 w-3.5" />
            ) : (
              <PlayIcon className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>
          
          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#877a74]/20 text-[#49363b] hover:bg-[#877a74]/30 transition-colors"
            aria-label="Restart"
          >
            <ArrowPathIcon className="h-3 w-3" />
          </button>
        </div>
        
        {/* Tempo indicator and controls in a pill */}
        <div className="bg-white border border-[#877a74]/20 rounded-full py-0.5 px-2 flex items-center shadow-sm mx-3">
          <button 
            onClick={decreaseTempo}
            className="p-0.5 rounded-sm hover:bg-[#e5d8ce]/50 text-[#49363b]"
            aria-label="Decrease tempo"
          >
            <MinusIcon className="h-2.5 w-2.5" />
          </button>
          
          <span className="text-xs font-medium text-[#241c1c] mx-2">
            {tempoValue}
          </span>
          
          <button 
            onClick={increaseTempo}
            className="p-0.5 rounded-sm hover:bg-[#e5d8ce]/50 text-[#49363b]"
            aria-label="Increase tempo"
          >
            <PlusIcon className="h-2.5 w-2.5" />
          </button>
        </div>
        
        {/* Playback position indicator */}
        <div className="ml-auto text-xs text-[#49363b] font-mono">
          {currentChordIndex >= 0 ? `${currentChordIndex + 1}/${chords.length}` : ''}
        </div>
      </div>
      
      {/* Integrated chord visualization and progress bar */}
      <div className="relative w-full">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#877a74]/30 scrollbar-track-transparent w-full">
          {chords.map((chord, index) => (
            <div
              key={`${getChordName(chord)}-${index}`}
              className={`flex-shrink-0 h-8 flex items-center justify-center px-3 rounded-sm border transition-all duration-150 ${
                currentChordIndex === index
                  ? "border-[#49363b] bg-[#49363b] text-white shadow-sm scale-105 z-10"
                  : "border-[#877a74]/30 bg-white text-[#241c1c] hover:border-[#877a74]"
              }`}
            >
              <span className="text-xs font-medium">{getChordName(chord)}</span>
            </div>
          ))}
        </div>
        
        {/* Thin progress bar at the bottom */}
        <div className="w-full h-0.5 bg-[#877a74]/20 rounded-full mt-1.5">
          {isPlaying && (
            <div 
              className="h-full bg-[#49363b] rounded-full transition-all duration-200"
              style={{ 
                width: `${(currentChordIndex + 1) * (100 / chords.length)}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressionPlayer;
