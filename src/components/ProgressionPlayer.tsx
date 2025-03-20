import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { playProgression, initAudio } from '../utils/audioUtils';

interface ProgressionPlayerRef {
  stop: () => void;
  isPlaying: () => boolean;
}

interface ProgressionPlayerProps {
  chords: string[];
  tempo?: number; // in BPM
}

const ProgressionPlayer = ({ 
  chords, 
  tempo = 80
}: ProgressionPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempoValue, setTempoValue] = useState(tempo);
  const progressionPlayerRef = useRef<ProgressionPlayerRef | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initAudio();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initializeAudio();
    
    return () => {
      stopPlayback();
    };
  }, []);
  
  // Reset playback when chords change
  useEffect(() => {
    if (isPlaying) {
      stopPlayback();
    }
  }, [chords]);

  const stopPlayback = useCallback(() => {
    if (progressionPlayerRef.current) {
      progressionPlayerRef.current.stop();
      progressionPlayerRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentChordIndex(-1);
  }, []);

  const startPlayback = useCallback(async () => {
    // Stop any existing playback
    stopPlayback();
    
    // Set state for UI
    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    // Initialize audio on first interaction
    try {
      await initAudio();
      
      // Start audio playback with callbacks for UI synchronization
      progressionPlayerRef.current = playProgression(
        chords,
        tempoValue,
        (index) => {
          // Update the current chord index for UI highlighting
          setCurrentChordIndex(index);
        },
        () => {
          // Reset UI state when playback completes
          setIsPlaying(false);
          setCurrentChordIndex(-1);
        }
      );
      
      // Double-check playback state after a short delay
      // This ensures UI is in sync with actual audio state
      setTimeout(() => {
        if (progressionPlayerRef.current && !progressionPlayerRef.current.isPlaying()) {
          setIsPlaying(false);
          setCurrentChordIndex(-1);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to start playback:', error);
      setIsPlaying(false);
      setCurrentChordIndex(-1);
    }
  }, [chords, stopPlayback, tempoValue]);

  const togglePlayback = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  };

  const handleRestart = async () => {
    stopPlayback();
    
    // Small delay to ensure complete cleanup
    setTimeout(async () => {
      await startPlayback();
    }, 100);
  };

  return (
    <div className="w-full bg-zinc-100 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-zinc-900">Progression Player</h3>
        <div className="flex space-x-2">
          <button
            onClick={togglePlayback}
            className="p-2 rounded-full bg-zinc-700 text-white hover:bg-zinc-800 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleRestart}
            className="p-2 rounded-full bg-zinc-700 text-white hover:bg-zinc-800 transition-colors"
            aria-label="Restart"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <div className="relative ml-2">
            <select
              value={tempoValue}
              onChange={(e) => setTempoValue(Number(e.target.value))}
              className="pl-3 pr-8 py-2 text-sm rounded-md border border-zinc-300 bg-white text-zinc-700 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
            >
              <option value="60">Slow (60 BPM)</option>
              <option value="80">Medium (80 BPM)</option>
              <option value="100">Fast (100 BPM)</option>
              <option value="120">Very Fast (120 BPM)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-700">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {chords.map((chord, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              currentChordIndex === index && isPlaying
                ? 'border-zinc-400 bg-zinc-200'
                : 'border-zinc-200 bg-white'
            } transition-all duration-200 flex flex-col items-center justify-center`}
          >
            <span className="text-lg font-medium text-zinc-900">{chord}</span>
            <span className="text-xs text-zinc-500 mt-1">
              {index === 0 ? 'Start' : index === chords.length - 1 ? 'End' : `Chord ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressionPlayer;
