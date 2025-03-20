import { useState, useEffect, useCallback } from 'react';
import { ChordProgression } from '../types';
import { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite as checkIsFavorite,
  toggleFavorite as toggleFavoriteService
} from '../services/favoriteService';

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
    
    // Listen for storage events (changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chordcraft_favorites') {
        loadFavorites();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load favorites from localStorage
  const loadFavorites = useCallback(() => {
    setLoading(true);
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);
    setLoading(false);
  }, []);

  // Check if a progression is in favorites
  const isFavorite = useCallback((id: string) => {
    return checkIsFavorite(id);
  }, []);

  // Add a progression to favorites
  const addFavorite = useCallback((progression: ChordProgression) => {
    const success = addToFavorites(progression);
    if (success) {
      loadFavorites();
    }
    return success;
  }, [loadFavorites]);

  // Remove a progression from favorites
  const removeFavorite = useCallback((id: string) => {
    const success = removeFromFavorites(id);
    if (success) {
      loadFavorites();
    }
    return success;
  }, [loadFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((progression: ChordProgression) => {
    const isNowFavorite = toggleFavoriteService(progression);
    loadFavorites();
    return isNowFavorite;
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
