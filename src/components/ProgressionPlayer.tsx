import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Chord } from '../types';
import { getChordName } from '../utils/chordUtils';
import * as Tone from 'tone';

interface ProgressionPlayerProps {
  chords: Array<Chord | { name: string }>;
  tempo?: number; // in BPM
}

const ProgressionPlayer = ({ 
  chords, 
  tempo = 80
}: ProgressionPlayerProps) => {
  const [tempoValue, setTempoValue] = useState(tempo);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localCurrentIndex, setLocalCurrentIndex] = useState(-1);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const transportIdRef = useRef<number[]>([]);
  
  // Use our custom hook for audio playback
  const { isPlaying, currentChordIndex, play, stop, toggle } = useAudioPlayer();
  
  // Reset playback when chords change
  useEffect(() => {
    if (isPlaying) {
      stop();
    }
    if (localIsPlaying) {
      directStopPlayback();
    }
  }, [chords, isPlaying, stop]);

  // Direct audio playback method that doesn't rely on our hooks/utils
  const directStartPlayback = async () => {
    try {
      console.log('Direct playback attempting to start');
      
      // First stop any existing playback
      directStopPlayback();
      
      // Make sure Tone.js is started (browser requirement)
      await Tone.start();
      console.log('Tone.js started');
      
      // Initialize synth if needed
      if (!synthRef.current) {
        console.log('Creating synth');
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synthRef.current.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
        });
        // Set a reasonable volume
        Tone.getDestination().volume.value = -10;
      }
      
      // Calculate timing based on tempo
      const beatDuration = 60 / tempoValue;
      const chordDuration = beatDuration * 2; // Each chord lasts 2 beats
      
      // Schedule all chords
      const ids: number[] = [];
      
      // Reset transport position
      Tone.getTransport().position = 0;
      
      // Schedule each chord
      chords.forEach((chord, index) => {
        const startTime = index * chordDuration;
        const chordName = getChordName(chord);
        
        // Schedule the chord
        const id = Tone.getTransport().schedule((time) => {
          console.log(`Playing chord ${index}: ${chordName}`);
          
          // Update UI
          setLocalCurrentIndex(index);
          
          // Play chord
          if (synthRef.current) {
            const notes = getNotes(chordName);
            synthRef.current.triggerAttackRelease(notes, `${chordDuration}s`, time);
          }
        }, `+${startTime}`);
        
        ids.push(id);
      });
      
      // Schedule completion
      const totalDuration = chords.length * chordDuration;
      const completionId = Tone.getTransport().schedule(() => {
        console.log('Playback completed');
        setLocalIsPlaying(false);
        setLocalCurrentIndex(-1);
        Tone.getTransport().stop();
      }, `+${totalDuration + 0.1}`);
      
      ids.push(completionId);
      transportIdRef.current = ids;
      
      // Start playback
      console.log('Starting transport');
      Tone.getTransport().start();
      setLocalIsPlaying(true);
      setLocalCurrentIndex(0);
      
      console.log('Direct playback started successfully');
    } catch (error) {
      console.error('Error in direct playback:', error);
      setLocalIsPlaying(false);
      setLocalCurrentIndex(-1);
    }
  };
  
  // Helper function to get chord notes
  const getNotes = (chordName: string) => {
    // Actually calculate the chord notes based on the chord name
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
  
  // Direct stop method
  const directStopPlayback = () => {
    try {
      console.log('Stopping direct playback');
      
      // Clear scheduled events
      transportIdRef.current.forEach(id => {
        Tone.getTransport().clear(id);
      });
      transportIdRef.current = [];
      
      // Stop transport
      Tone.getTransport().stop();
      
      // Release all notes
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      
      // Update state
      setLocalIsPlaying(false);
      setLocalCurrentIndex(-1);
      
      console.log('Direct playback stopped');
    } catch (error) {
      console.error('Error stopping direct playback:', error);
    }
  };

  const handleTogglePlayback = async () => {
    console.log('Toggle playback clicked');
    try {
      // Use direct methods instead of hooks
      if (localIsPlaying) {
        directStopPlayback();
      } else {
        await directStartPlayback();
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const handleRestart = async () => {
    console.log('Restart clicked');
    try {
      // Stop any current playback
      directStopPlayback();
      
      // Start fresh playback
      console.log('Starting fresh playback');
      await directStartPlayback();
    } catch (error) {
      console.error('Failed to restart playback:', error);
    }
  };

  const decreaseTempo = () => {
    setTempoValue(Math.max(60, tempoValue - 5));
  };

  const increaseTempo = () => {
    setTempoValue(Math.min(180, tempoValue + 5));
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempoValue(Number(e.target.value));
  };

  return (
    <div className="w-full bg-zinc-100 rounded-lg p-6 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-zinc-900">Progression Player</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleTogglePlayback}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-white hover:bg-black transition-colors"
            aria-label={localIsPlaying ? "Pause" : "Play"}
          >
            {localIsPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-200 text-zinc-800 hover:bg-zinc-300 transition-colors"
            aria-label="Restart"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chord visualization */}
      <div className="relative mb-6 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-500">Current chord</span>
          <span className="text-sm text-zinc-500">{tempoValue} BPM</span>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
          {chords.map((chord, index) => (
            <div
              key={`${getChordName(chord)}-${index}`}
              className={`flex-shrink-0 h-16 flex items-center justify-center px-4 rounded-md border-2 transition-all duration-200 ${
                localCurrentIndex === index
                  ? "border-zinc-800 bg-zinc-800 text-white scale-105 shadow-md"
                  : "border-zinc-300 bg-white text-zinc-800"
              }`}
            >
              <span className="text-lg font-medium">{getChordName(chord)}</span>
            </div>
          ))}
        </div>
        
        {/* Playback progress bar */}
        <div className="w-full h-1 bg-zinc-200 rounded-full mt-4">
          {localIsPlaying && (
            <div 
              className="h-full bg-zinc-800 rounded-full transition-all duration-200"
              style={{ 
                width: `${(localCurrentIndex + 1) * (100 / chords.length)}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Tempo slider */}
      <div className="mb-2">
        <label htmlFor="tempo-slider" className="block text-sm font-medium text-zinc-700 mb-2">
          Tempo
        </label>
        <div className="flex items-center space-x-3">
          <button 
            onClick={decreaseTempo}
            className="p-1 rounded-md hover:bg-zinc-200 text-zinc-700"
            aria-label="Decrease tempo"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          
          <input
            id="tempo-slider"
            type="range"
            min="60"
            max="180"
            step="1"
            value={tempoValue}
            onChange={handleTempoChange}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800"
          />
          
          <button 
            onClick={increaseTempo}
            className="p-1 rounded-md hover:bg-zinc-200 text-zinc-700"
            aria-label="Increase tempo"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          
          <span className="text-sm font-medium text-zinc-800 w-12 text-right">
            {tempoValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressionPlayer;
