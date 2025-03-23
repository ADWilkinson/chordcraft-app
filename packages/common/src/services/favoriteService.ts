import { ChordProgression } from '../types';
import { Storage } from '../utils/storage';

const FAVORITES_KEY = 'chordcraft_favorites';

/**
 * Get all favorite progressions from storage
 * @returns Array of favorite chord progressions
 */
export const getFavorites = async (): Promise<ChordProgression[]> => {
  try {
    const favoritesJson = await Storage.getItem(FAVORITES_KEY);
    if (!favoritesJson) return [];
    
    const favorites = favoritesJson;
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error getting favorites from storage:', error);
    return [];
  }
};

/**
 * Check if a progression is in favorites
 * @param progressionId - The ID of the progression to check
 * @returns Boolean indicating if the progression is a favorite
 */
export const isFavorite = async (progressionId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some(fav => fav.id === progressionId);
};

/**
 * Add a progression to favorites
 * @param progression - The progression to add to favorites
 * @returns Boolean indicating success
 */
export const addToFavorites = async (progression: ChordProgression): Promise<boolean> => {
  try {
    if (!progression.id) {
      console.error('Cannot add progression without ID to favorites');
      return false;
    }
    
    // Don't add if already in favorites
    if (await isFavorite(progression.id)) {
      return true;
    }
    
    const favorites = await getFavorites();
    
    // Add timestamp if not present (use Date object for type compatibility)
    const progressionWithTimestamp = {
      ...progression,
      favoritedAt: new Date()
    };
    
    favorites.push(progressionWithTimestamp);
    return await Storage.setItem(FAVORITES_KEY, favorites);
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
export const removeFromFavorites = async (progressionId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== progressionId);
    
    if (updatedFavorites.length === favorites.length) {
      // Nothing was removed
      return false;
    }
    
    return await Storage.setItem(FAVORITES_KEY, updatedFavorites);
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
export const toggleFavorite = async (progression: ChordProgression): Promise<boolean> => {
  if (!progression.id) {
    console.error('Cannot toggle favorite for progression without ID');
    return false;
  }
  
  if (await isFavorite(progression.id)) {
    await removeFromFavorites(progression.id);
    return false;
  } else {
    await addToFavorites(progression);
    return true;
  }
};