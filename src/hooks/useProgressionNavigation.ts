import { useState, useCallback } from 'react';
import { ChordProgression } from '../types';

interface UseProgressionNavigationProps {
  initialProgressions?: ChordProgression[];
  initialIndex?: number;
}

interface UseProgressionNavigationResult {
  progressions: ChordProgression[];
  setProgressions: React.Dispatch<React.SetStateAction<ChordProgression[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  currentProgression: ChordProgression | undefined;
  goToNextProgression: () => void;
  goToPreviousProgression: () => void;
  addProgression: (progression: ChordProgression) => void;
}

/**
 * Custom hook for managing progression navigation
 */
export const useProgressionNavigation = ({
  initialProgressions = [],
  initialIndex = 0
}: UseProgressionNavigationProps = {}): UseProgressionNavigationResult => {
  const [progressions, setProgressions] = useState<ChordProgression[]>(initialProgressions);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  const currentProgression = progressions[currentIndex];

  // Navigation handlers
  const goToNextProgression = useCallback(() => {
    if (currentIndex < progressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, progressions.length]);

  const goToPreviousProgression = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Add a new progression and navigate to it
  const addProgression = useCallback((progression: ChordProgression) => {
    setProgressions(prev => {
      const updatedProgressions = [...prev, progression];
      // Update the current index after the state has been updated
      setTimeout(() => {
        setCurrentIndex(updatedProgressions.length - 1);
      }, 0);
      return updatedProgressions;
    });
  }, []);

  return {
    progressions,
    setProgressions,
    currentIndex,
    setCurrentIndex,
    currentProgression,
    goToNextProgression,
    goToPreviousProgression,
    addProgression
  };
};
