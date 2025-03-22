import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import { MidiNumbers } from 'react-piano';
import { Chord } from '../types';
import { getChordName } from '../utils/chordUtils';
import CustomPiano from './CustomPiano';
import '../styles/custom-piano.css';

interface ProgressionPlayerProps {
  chords: Array<string | Chord | { name: string }>;
  tempo?: number; // in BPM
}

const ProgressionPlayer: React.FC<ProgressionPlayerProps> = ({ 
  chords, 
  tempo = 80
}) => {
  // State for player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempoValue, setTempoValue] = useState(tempo);
  const [visualizerChord, setVisualizerChord] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [activeMidiNumbers, setActiveMidiNumbers] = useState<number[]>([]);
  
  // Refs for audio playback
  const isPlayingRef = useRef(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const currentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transportIdRef = useRef<NodeJS.Timeout[]>([]);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset playback when chords change
  useEffect(() => {
    if (isPlaying) {
      stopPlayback();
    }
    setCurrentChordIndex(-1);
    setVisualizerChord(null);
    setActiveNotes([]);
  }, [chords]);

  // Helper function to get chord notes
  const getNotes = useCallback((chordName: string): string[] => {
    if (!chordName) {
      console.warn('Empty chord name provided, defaulting to C major');
      return ['C4', 'E4', 'G4'];
    }
    
    const chordMap: Record<string, string[]> = {
      'C': ['C4', 'E4', 'G4'],
      'C#': ['C#4', 'F4', 'G#4'],
      'Db': ['Db4', 'F4', 'Ab4'],
      'D': ['D4', 'F#4', 'A4'],
      'D#': ['D#4', 'G4', 'A#4'],
      'Eb': ['Eb4', 'G4', 'Bb4'],
      'E': ['E4', 'G#4', 'B4'],
      'F': ['F3', 'A3', 'C4'],
      'F#': ['F#3', 'A#3', 'C#4'],
      'Gb': ['Gb3', 'Bb3', 'Db4'],
      'G': ['G3', 'B3', 'D4'],
      'G#': ['G#3', 'C4', 'D#4'],
      'Ab': ['Ab3', 'C4', 'Eb4'],
      'A': ['A3', 'C#4', 'E4'],
      'A#': ['A#3', 'D4', 'F4'],
      'Bb': ['Bb3', 'D4', 'F4'],
      'B': ['B3', 'D#4', 'F#4'],
      
      'Cm': ['C4', 'Eb4', 'G4'],
      'C#m': ['C#4', 'E4', 'G#4'],
      'Dbm': ['Db4', 'E4', 'Ab4'],
      'Dm': ['D4', 'F4', 'A4'],
      'D#m': ['D#4', 'F#4', 'A#4'],
      'Ebm': ['Eb4', 'Gb4', 'Bb4'],
      'Em': ['E4', 'G4', 'B4'],
      'Fm': ['F3', 'Ab3', 'C4'],
      'F#m': ['F#3', 'A3', 'C#4'],
      'Gbm': ['Gb3', 'A3', 'Db4'],
      'Gm': ['G3', 'Bb3', 'D4'],
      'G#m': ['G#3', 'B3', 'D#4'],
      'Abm': ['Ab3', 'B3', 'Eb4'],
      'Am': ['A3', 'C4', 'E4'],
      'A#m': ['A#3', 'C#4', 'F4'],
      'Bbm': ['Bb3', 'Db4', 'F4'],
      'Bm': ['B3', 'D4', 'F#4'],
    };
    
    if (chordMap[chordName]) {
      return chordMap[chordName];
    }
    
    const root = chordName.charAt(0).toUpperCase() + (chordName.charAt(1) === '#' || chordName.charAt(1) === 'b' ? chordName.charAt(1) : '');
    const isMinor = chordName.includes('m') && !chordName.includes('maj');
    
    const simpleChordName = isMinor ? root + 'm' : root;
    
    if (chordMap[simpleChordName]) {
      return chordMap[simpleChordName];
    }
    
    return ['C4', 'E4', 'G4'];
  }, []);

  // Convert note names to MIDI numbers for react-piano
  const convertNotesToMidi = useCallback((notes: string[]): number[] => {
    return notes.map(note => {
      // Extract note name and octave
      const noteName = note.replace(/\d+$/, '');
      const octave = parseInt(note.slice(-1));
      
      // Convert to MIDI number
      return MidiNumbers.fromNote(`${noteName.toLowerCase()}${octave}`);
    });
  }, []);

  // Play a chord
  const playChord = useCallback(async (index: number) => {
    if (!isPlayingRef.current || index >= chords.length) {
      if (index >= chords.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
      return;
    }
    
    try {
      if (!synthRef.current) {
        return;
      }
      
      const chord = chords[index];
      const chordName = getChordName(chord);
      
      setCurrentChordIndex(index);
      setVisualizerChord(chordName);
      
      const notes = getNotes(chordName);
      setActiveNotes(notes);
      setActiveMidiNumbers(convertNotesToMidi(notes));
      
      const beatDuration = 60 / tempoValue;
      const chordDuration = beatDuration * 2; 
      
      synthRef.current.triggerAttackRelease(notes, chordDuration * 0.8);
      
      currentTimeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          playChord(index + 1);
        }
      }, chordDuration * 1000);
      
      transportIdRef.current.push(currentTimeoutRef.current);
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }, [chords, getChordName, getNotes, tempoValue, convertNotesToMidi]);

  // Start audio playback
  const startPlayback = useCallback(async () => {
    try {
      stopPlayback();
      
      isPlayingRef.current = true;
      
      await Tone.start();
      
      if (Tone.context.state !== 'running') {
        await Tone.context.resume();
      }
      
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synthRef.current.set({
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
        });
        
        Tone.getDestination().volume.value = -3;
      }
      
      setIsPlaying(true);
      
      await playChord(0);
      
    } catch (error) {
      console.error('Failed to start playback:', error);
      stopPlayback();
    }
  }, [playChord]);

  // Stop audio playback
  const stopPlayback = useCallback(() => {
    try {
      isPlayingRef.current = false;
      
      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
        currentTimeoutRef.current = null;
      }
      
      transportIdRef.current.forEach(id => {
        clearTimeout(id);
      });
      transportIdRef.current = [];
      
      Tone.Transport.cancel();
      Tone.Transport.stop();
      
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      setVisualizerChord(null);
      setActiveNotes([]);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }, []);

  // Restart playback
  const handleRestart = useCallback(async () => {
    try {
      stopPlayback();
      
      setTimeout(async () => {
        isPlayingRef.current = true;
        
        await startPlayback();
      }, 100);
    } catch (error) {
      console.error('Failed to restart playback:', error);
      stopPlayback();
    }
  }, [startPlayback, stopPlayback]);

  const resetPlayback = handleRestart;

  // Tempo controls
  const decreaseTempo = useCallback(() => {
    setTempoValue(prev => Math.max(60, prev - 5));
  }, []);

  const increaseTempo = useCallback(() => {
    setTempoValue(prev => Math.min(180, prev + 5));
  }, []);

  // Handle clicking on a chord
  const handleChordClick = (index: number) => {
    if (isPlaying) {
      stopPlayback();
      setTimeout(() => {
        setCurrentChordIndex(index);
        playChord(index);
      }, 100);
    } else {
      const chord = chords[index];
      const chordName = getChordName(chord);
      
      setCurrentChordIndex(index);
      setVisualizerChord(chordName);
      
      const notes = getNotes(chordName);
      setActiveNotes(notes);
      setActiveMidiNumbers(convertNotesToMidi(notes));
      
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(notes, 1);
      } else {
        const initAndPlay = async () => {
          await Tone.start();
          if (Tone.context.state !== 'running') {
            await Tone.context.resume();
          }
          
          synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
          synthRef.current.set({
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
          });
          
          Tone.getDestination().volume.value = -3;
          
          synthRef.current.triggerAttackRelease(notes, 1);
        };
        
        initAndPlay();
      }
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerContainerRef.current) return;
      
      const rect = playerContainerRef.current.getBoundingClientRect();
      const isInViewport = 
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);
      
      if (!isInViewport) return;
      
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ': 
          e.preventDefault();
          isPlaying ? stopPlayback() : startPlayback();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetPlayback();
          break;
        case '+':
        case '=': 
          e.preventDefault();
          increaseTempo();
          break;
        case '-':
        case '_': 
          e.preventDefault();
          decreaseTempo();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, startPlayback, stopPlayback, resetPlayback, increaseTempo, decreaseTempo]);

  return (
    <div ref={playerContainerRef} className="mt-4 sm:px-6 w-full">
      {/* Chord display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-6">
        {chords.map((chord, index) => {
          const chordName = getChordName(chord);
          const isCurrentChord = index === currentChordIndex;
          
          return (
            <div 
              key={`${chordName}-${index}`}
              className={`
                relative rounded-sm px-3 py-6 flex flex-col items-center justify-center min-h-[60px]
                ${isCurrentChord 
                  ? 'bg-[#49363b] text-[#e5d8ce] shadow-md' 
                  : 'bg-[#fff]/80 text-[#49363b] border border-[#877a74]'}
                transition-all duration-300 cursor-pointer hover:shadow-lg
              `}
              onClick={() => handleChordClick(index)}
            >
              {/* Chord number indicator */}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-sm bg-[#e5d8ce]/30 flex items-center justify-center">
                <span className={`text-xs font-medium text-[${isCurrentChord ? '#e5d8ce' : '#49363b'}]/50`}>{index + 1}</span>
              </div>
              
              {/* Chord name */}
              <span className={`text-xl font-bold mt-2 ${isCurrentChord ? 'text-[#e5d8ce]' : 'text-[#49363b]'}`}>
                {chordName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chord Visualizer */}
      <AnimatePresence>
        {visualizerChord && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-[#f9f5f1] p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[#49363b]">
              
                </h3>
              </div>
              
              {/* Piano View */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="flex justify-center py-2">
                  <div className="text-center w-full max-w-xl mx-auto justify-center">
                    <div className="text-xs text-[#49363b] mb-1">
                      Notes: {activeNotes.map(note => note.replace(/\d+$/, '')).join(', ')}
                    </div>
                    <div className="mx-auto text-center justify-center flex p-3 rounded-sm">
                      <CustomPiano
                        activeNotes={activeMidiNumbers}
                        startOctave={3}
                        endOctave={4}
                        className="mb-2"
                      />
                    </div>
                    <div className="text-xs text-[#49363b]">
                      Click on a chord to hear and visualize it
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Notes in the chord */}
              <div className="mt-3 text-center">
                <p className="text-sm text-[#877a74]">
                
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Playback controls */}
      <div className="flex items-center justify-between mt-4 px-4 py-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? stopPlayback : startPlayback}
            className="w-12 h-12 rounded-full bg-[#49363b] text-[#e5d8ce] flex items-center justify-center shadow-md hover:bg-[#241c1c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#49363b]/50 focus:ring-offset-2"
            aria-label={isPlaying ? "Pause (Spacebar)" : "Play (Spacebar)"}
            title={isPlaying ? "Pause (Spacebar)" : "Play (Spacebar)"}
          >
            {isPlaying ? (
              <PauseIcon className="cursor-pointer h-6 w-6" />
            ) : (
              <PlayIcon className="cursor-pointer h-6 w-6" />
            )}
          </button>
          
          <button
            onClick={resetPlayback}
            className="w-10 h-10 rounded-full bg-[#e5d8ce] text-[#49363b] flex items-center justify-center shadow-sm hover:bg-[#d6c7bc] transition-colors focus:outline-none focus:ring-2 focus:ring-[#49363b]/30 focus:ring-offset-2"
            aria-label="Reset (R key)"
            title="Reset (R key)"
          >
            <ForwardIcon className="cursor-pointer h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={decreaseTempo}
            className="w-8 h-8 rounded-full bg-[#e5d8ce] text-[#49363b] flex items-center justify-center shadow-sm hover:bg-[#d6c7bc] transition-colors focus:outline-none focus:ring-2 focus:ring-[#49363b]/30 focus:ring-offset-2"
            aria-label="Decrease tempo (- key)"
            title="Decrease tempo (- key)"
          >
            <ChevronDownIcon className="cursor-pointer h-4 w-4" />
          </button>
          
          <div className="text-sm font-medium text-[#49363b] w-20 text-center">
            {tempoValue} BPM
          </div>
          
          <button
            onClick={increaseTempo}
            className="w-8 h-8 rounded-full bg-[#e5d8ce] text-[#49363b] flex items-center justify-center shadow-sm hover:bg-[#d6c7bc] transition-colors focus:outline-none focus:ring-2 focus:ring-[#49363b]/30 focus:ring-offset-2"
            aria-label="Increase tempo (+ key)"
            title="Increase tempo (+ key)"
          >
            <ChevronUpIcon className="cursor-pointer h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressionPlayer;
