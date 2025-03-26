import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { Chord } from '../types';
import { getChordName } from '../utils/chordUtils';
import { useChordPlayer } from '../hooks/useChordPlayer';
import CustomPiano from './CustomPiano';
import '../styles/custom-piano.css';

interface ProgressionPlayerProps {
  chords: Array<string | Chord | { name: string }>;
  tempo?: number; // in BPM
}

// Define the methods exposed by the component
export interface ProgressionPlayerRef {
  togglePlayback: () => void;
  resetPlayback: () => void;
  adjustTempo: (amount: number) => void;
}

const ProgressionPlayer = forwardRef<ProgressionPlayerRef, ProgressionPlayerProps>(({
  chords,
  tempo = 80
}, ref) => {
  // Use our custom hook for chord playback
  const {
    isPlaying,
    currentChordIndex,
    activeMidiNumbers,
    isReady,
    playChord,
    stopPlayback,
    togglePlayback,
    setTempo: setTempoValue,
    setIsPlaying,
  } = useChordPlayer(chords, { tempo, autoAdvance: true });

  // Additional UI state
  const [visualizerChord, setVisualizerChord] = useState<string | null>(null);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Get the current tempo value from the hook for display
  const [displayTempo, setDisplayTempo] = useState(tempo);

  // Update visualizer chord when current chord changes
  React.useEffect(() => {
    if (currentChordIndex >= 0 && currentChordIndex < chords.length) {
      const chordName = getChordName(chords[currentChordIndex]);
      setVisualizerChord(chordName);
    } else {
      setVisualizerChord(null);
    }
  }, [currentChordIndex, chords]);

  // Handle tempo change
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value);
    setDisplayTempo(newTempo);
    setTempoValue(newTempo);
  };

  // Handle manual chord selection
  const handleChordSelect = (index: number) => {
    if (index === currentChordIndex) {
      return;
    }

    // Stop current playback if playing
    if (isPlaying) {
      stopPlayback();
    }

    // Play the selected chord
    playChord(index);
  };

  // Toggle visualizer visibility
  const toggleVisualizer = () => {
    setIsVisualizerOpen(!isVisualizerOpen);
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setIsControlsOpen(!isControlsOpen);
  };

  // Reset playback to beginning
  const resetPlayback = () => {
    // Stop playback regardless of current state
    stopPlayback();

    // Small delay to ensure the previous playback is fully stopped
    setTimeout(() => {
      // Start playback from the beginning
      setIsPlaying(true);

      // Play the first chord which will continue playback
      playChord(0);
    }, 10);
  };

  // Adjust tempo by specified amount
  const adjustTempo = (amount: number) => {
    const newTempo = Math.max(40, Math.min(200, displayTempo + amount));
    setDisplayTempo(newTempo);
    setTempoValue(newTempo);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    togglePlayback,
    resetPlayback,
    adjustTempo
  }));

  return (
    <div
      className="relative bg-[#1b150f] border border-[#49363b]/30 rounded-sm overflow-hidden"
      ref={playerContainerRef}
    >
      {/* Chord progression display */}
      <div className="p-2 sm:p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-2.5">
          {chords.map((chord, index) => {
            const chordName = getChordName(chord);
            const isActive = index === currentChordIndex;

            return (
              <button
                key={`${index}-${chordName}`}
                onClick={() => handleChordSelect(index)}
                className={`
                  px-4 py-3 rounded-sm font-mono text-sm md:text-base transition-all duration-300 cursor-pointer
                  ${isActive
                    ? 'bg-[#e5d8ce] text-[#1b150f] ring-2 ring-[#e5d8ce]/70 transform scale-110 shadow-md'
                    : 'bg-[#49363b]/30 hover:bg-[#49363b]/50 text-[#e5d8ce] hover:shadow hover:translate-y-[-1px]'
                  }
                `}
              >
                {chordName}
              </button>
            );
          })}
        </div>

        {/* Player controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayback}
              disabled={!isReady}
              className={`
                p-2 rounded-full bg-[#49363b] hover:bg-[#49363b]/80 text-white transition-all duration-300
                transform hover:scale-105 active:scale-95 cursor-pointer
                ${!isReady ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
              `}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={resetPlayback}
              className="p-2 rounded-full bg-[#49363b]/50 hover:bg-[#49363b]/70 text-white transition-all duration-300
              transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
              aria-label="Reset"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleControls}
              className="text-[#e5d8ce]/70 hover:text-[#e5d8ce] p-1 transition-colors duration-200 cursor-pointer"
              aria-label={isControlsOpen ? 'Hide controls' : 'Show controls'}
            >
              {isControlsOpen ?
                <ChevronUpIcon className="h-4 w-4" /> :
                <ChevronDownIcon className="h-4 w-4" />
              }
            </button>

            <button
              onClick={toggleVisualizer}
              className="text-[#e5d8ce]/70 hover:text-[#e5d8ce] p-1 ml-2 transition-colors duration-200 cursor-pointer"
              aria-label={isVisualizerOpen ? 'Hide visualizer' : 'Show visualizer'}
            >
              {isVisualizerOpen ?
                <ChevronUpIcon className="h-4 w-4" /> :
                <ChevronDownIcon className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        {/* Additional controls (tempo) */}
        <AnimatePresence>
          {isControlsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-2 border-t border-[#49363b]/20">
                <div className="flex items-center justify-between">
                  <label htmlFor="tempo" className="text-sm text-[#e5d8ce]/70">
                    Tempo: <span className="text-[#e5d8ce]">{displayTempo}</span> BPM
                  </label>
                  <input
                    id="tempo"
                    type="range"
                    min="40"
                    max="200"
                    step="1"
                    value={displayTempo}
                    onChange={handleTempoChange}
                    className="w-32 md:w-48 h-2 accent-[#e5d8ce] cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Piano visualizer */}
      <AnimatePresence>
        {isVisualizerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#49363b]/20 pt-2 px-4 pb-4 md:px-6 md:pb-6 bg-gradient-to-b from-[#1b150f] to-[#261c15]">
              <div className="mx-auto sm:max-w-xl">
                <CustomPiano
                  activeNotes={activeMidiNumbers}
                />
                {visualizerChord && (
                  <div className="mt-4 text-center text-sm text-[#e5d8ce]/70">
                    Current chord: <span className="text-[#e5d8ce] font-medium">{visualizerChord}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ProgressionPlayer);
