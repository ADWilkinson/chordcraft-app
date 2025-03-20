import { useState, useEffect, useCallback } from 'react';
import { ChordProgression, GenerationParams } from '../types';
import { 
  fetchProgressions, 
  requestChordProgression,
  likeProgression,
  flagProgression
} from '../services/progressionService';
import { reportProgression } from '../services/reportService';

/**
 * Custom hook to manage chord progressions
 */
export const useProgression = () => {
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch progressions based on params
  const getProgressions = useCallback(async (params: GenerationParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchProgressions(params);
      setProgressions(result);
      
      // Set the first progression as current if available
      if (result.length > 0) {
        setCurrentProgression(result[0]);
      } else {
        setCurrentProgression(null);
      }
      
      return result;
    } catch (err) {
      setError('Failed to fetch progressions');
      console.error('Error fetching progressions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a new progression using AI
  const generateProgression = useCallback(async (params: GenerationParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestChordProgression(params);
      
      if (result) {
        // Add the new progression to the list
        setProgressions(prev => [result, ...prev]);
        setCurrentProgression(result);
      }
      
      return result;
    } catch (err) {
      setError('Failed to generate progression');
      console.error('Error generating progression:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Like a progression
  const like = useCallback(async (id: string) => {
    try {
      await likeProgression(id);
      
      // Update the progressions and current progression with the new like count
      setProgressions(prev => prev.map(p => 
        p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
      ));
      
      if (currentProgression?.id === id) {
        setCurrentProgression(prev => 
          prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null
        );
      }
    } catch (err) {
      console.error('Error liking progression:', err);
    }
  }, [currentProgression]);

  // Report a progression
  const report = useCallback(async (id: string, reason: string, details: string = '') => {
    try {
      await reportProgression(id, reason, details);
      await flagProgression(id);
      
      // Update the progressions and current progression
      setProgressions(prev => prev.map(p => 
        p.id === id ? { ...p, flags: (p.flags || 0) + 1, reported: true } : p
      ));
      
      if (currentProgression?.id === id) {
        setCurrentProgression(prev => 
          prev ? { ...prev, flags: (prev.flags || 0) + 1, reported: true } : null
        );
      }
    } catch (err) {
      console.error('Error reporting progression:', err);
      throw err;
    }
  }, [currentProgression]);

  // Set a specific progression as current
  const setProgression = useCallback((progression: ChordProgression) => {
    setCurrentProgression(progression);
  }, []);

  return {
    progressions,
    currentProgression,
    loading,
    error,
    getProgressions,
    generateProgression,
    like,
    report,
    setProgression
  };
};