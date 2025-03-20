import { ChordProgression } from '../types';

const FAVORITES_KEY = 'chordcraft_favorites';

/**
 * Get all favorite progressions from localStorage
 * @returns Array of favorite chord progressions
 */
export const getFavorites = (): ChordProgression[] => {
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_KEY);
    if (!favoritesJson) return [];
    
    const favorites = JSON.parse(favoritesJson);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error getting favorites from localStorage:', error);
    return [];
  }
};

/**
 * Check if a progression is in favorites
 * @param progressionId - The ID of the progression to check
 * @returns Boolean indicating if the progression is a favorite
 */
export const isFavorite = (progressionId: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === progressionId);
};

/**
 * Add a progression to favorites
 * @param progression - The progression to add to favorites
 * @returns Boolean indicating success
 */
export const addToFavorites = (progression: ChordProgression): boolean => {
  try {
    if (!progression.id) {
      console.error('Cannot add progression without ID to favorites');
      return false;
    }
    
    // Don't add if already in favorites
    if (isFavorite(progression.id)) {
      return true;
    }
    
    const favorites = getFavorites();
    
    // Add timestamp if not present
    const progressionWithTimestamp = {
      ...progression,
      favoritedAt: new Date().toISOString()
    };
    
    favorites.push(progressionWithTimestamp);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

/**
 * Remove a progression from favorites
 * @param progressionId - The ID of the progression to remove
 * @returns Boolean indicating success
 */
export const removeFromFavorites = (progressionId: string): boolean => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== progressionId);
    
    if (updatedFavorites.length === favorites.length) {
      // Nothing was removed
      return false;
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

/**
 * Toggle favorite status of a progression
 * @param progression - The progression to toggle
 * @returns Boolean indicating if the progression is now a favorite
 */
export const toggleFavorite = (progression: ChordProgression): boolean => {
  if (!progression.id) {
    console.error('Cannot toggle favorite for progression without ID');
    return false;
  }
  
  if (isFavorite(progression.id)) {
    removeFromFavorites(progression.id);
    return false;
  } else {
    addToFavorites(progression);
    return true;
  }
};
