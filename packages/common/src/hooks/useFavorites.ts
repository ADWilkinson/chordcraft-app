import { useState, useEffect, useCallback } from 'react';
import { ChordProgression } from '../types';
import { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite as checkIsFavorite,
  toggleFavorite as toggleFavoriteService
} from '../services/favoriteService';
import { isPlatformWeb } from '../utils/platform';

/**
 * Custom hook to manage favorites
 * @returns Object with favorites state and methods to manage favorites
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<ChordProgression[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
    
    if (isPlatformWeb()) {
      // Listen for storage events (changes in other tabs) - web only
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'chordcraft_favorites') {
          loadFavorites();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // Load favorites from storage
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const loadedFavorites = await getFavorites();
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a progression is in favorites
  const isFavorite = useCallback(async (id: string): Promise<boolean> => {
    return await checkIsFavorite(id);
  }, []);

  // Add a progression to favorites
  const addFavorite = useCallback(async (progression: ChordProgression): Promise<boolean> => {
    try {
      const success = await addToFavorites(progression);
      if (success) {
        await loadFavorites();
      }
      return success;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  // Remove a progression from favorites
  const removeFavorite = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await removeFromFavorites(id);
      if (success) {
        await loadFavorites();
      }
      return success;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (progression: ChordProgression): Promise<boolean> => {
    try {
      const isNowFavorite = await toggleFavoriteService(progression);
      await loadFavorites();
      return isNowFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites
  };
};