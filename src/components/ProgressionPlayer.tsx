import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import ChordVisualizer from './ChordVisualizer';
import ChordTheoryModal from './ChordTheoryModal';
import { playProgression, initAudio } from '../utils/audioUtils';

interface ProgressionPlayerProps {
  chords: string[];
  numerals?: string[];
  tempo?: number; // in BPM
  keyContext: string;
}

const ProgressionPlayer = ({ 
  chords, 
  numerals,
  tempo = 80,
  keyContext
}: ProgressionPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [selectedChord, setSelectedChord] = useState('');
  const progressionPlayerRef = useRef<{ stop: () => void } | null>(null);

  // Calculate interval in ms from tempo (BPM)
  const interval = 60000 / tempo;

  const stopPlayback = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Stop audio playback
    if (progressionPlayerRef.current) {
      progressionPlayerRef.current.stop();
      progressionPlayerRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentChordIndex(-1);
  }, [intervalId]);

  const startPlayback = useCallback(() => {
    stopPlayback();
    setIsPlaying(true);
    setCurrentChordIndex(0);
    
    // Initialize audio on first interaction
    initAudio();
    
    // Start audio playback
    progressionPlayerRef.current = playProgression(
      chords,
      tempo,
      (index) => {
        setCurrentChordIndex(index);
      }
    );
    
    // Set up a timer to stop playback after all chords have played
    const totalDuration = (chords.length * interval * 2) + 100; // Add a small buffer
    const timerId = setTimeout(() => {
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      setIntervalId(null);
    }, totalDuration);
    
    setIntervalId(timerId as unknown as NodeJS.Timeout);
  }, [chords, interval, stopPlayback, tempo]);

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleChordClick = (index: number) => {
    if (isPlaying) {
      stopPlayback();
    }
    setCurrentChordIndex(index);
    setSelectedChord(chords[index]);
    setShowTheoryModal(true);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <div className="mb-6">
      <ChordVisualizer 
        chords={chords} 
        numerals={numerals}
        activeIndex={currentChordIndex}
        onChordClick={handleChordClick}
      />
      
      <div className="flex justify-center gap-4 mt-4">
        <motion.button
          className="flex items-center justify-center p-3 bg-zinc-800 text-white rounded-full shadow-md hover:bg-black transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause progression" : "Play progression"}
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </motion.button>
        
        <motion.button
          className="flex items-center justify-center p-3 bg-zinc-200 text-zinc-800 rounded-full shadow-md hover:bg-zinc-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stopPlayback}
          aria-label="Reset progression"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </motion.button>
        
        <motion.button
          className="flex items-center justify-center p-3 bg-zinc-200 text-zinc-800 rounded-full shadow-md hover:bg-zinc-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (currentChordIndex >= 0) {
              setSelectedChord(chords[currentChordIndex]);
              setShowTheoryModal(true);
            } else if (chords.length > 0) {
              setSelectedChord(chords[0]);
              setShowTheoryModal(true);
            }
          }}
          aria-label="View chord theory"
          disabled={chords.length === 0}
        >
          <InformationCircleIcon className="h-5 w-5" />
        </motion.button>
      </div>
      
      <div className="text-center mt-2 text-sm text-zinc-500">
        Tempo: {tempo} BPM • Click on a chord to learn more
      </div>
      
      {/* Chord Theory Modal */}
      <ChordTheoryModal 
        isOpen={showTheoryModal}
        onClose={() => setShowTheoryModal(false)}
        chordName={selectedChord}
        keyContext={keyContext}
      />
    </div>
  );
};

export default ProgressionPlayer;
