import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { playProgression, initAudio } from '../utils/audioUtils';

interface ProgressionPlayerRef {
  stop: () => void;
  isPlaying: () => boolean;
}

interface ProgressionPlayerProps {
  chords: { name: string }[];
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
        chords.map(chord => chord.name),
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
    <div className="w-full bg-zinc-100 rounded-lg p-6 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-zinc-900">Progression Player</h3>
        <div className="flex space-x-3">
          <button
            onClick={togglePlayback}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-white hover:bg-black transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
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
              key={`${chord.name}-${index}`}
              className={`flex-shrink-0 h-16 flex items-center justify-center px-4 rounded-md border-2 transition-all duration-200 ${
                currentChordIndex === index
                  ? "border-zinc-800 bg-zinc-800 text-white scale-105 shadow-md"
                  : "border-zinc-300 bg-white text-zinc-800"
              }`}
            >
              <span className="text-lg font-medium">{chord.name}</span>
            </div>
          ))}
        </div>
        
        {/* Playback progress bar */}
        <div className="w-full h-1 bg-zinc-200 rounded-full mt-4">
          {isPlaying && (
            <div 
              className="h-full bg-zinc-800 rounded-full transition-all duration-200"
              style={{ 
                width: `${(currentChordIndex + 1) * (100 / chords.length)}%`,
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
            onClick={() => setTempoValue(Math.max(60, tempoValue - 5))}
            className="p-1 rounded-md hover:bg-zinc-200 text-zinc-700"
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
            onChange={(e) => setTempoValue(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800"
          />
          
          <button 
            onClick={() => setTempoValue(Math.min(180, tempoValue + 5))}
            className="p-1 rounded-md hover:bg-zinc-200 text-zinc-700"
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
