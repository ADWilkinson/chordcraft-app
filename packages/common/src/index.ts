// Export types
export * from './types';
export * from './types/music';

// Export constants
export * from './constants/music';

// Export utilities
export * from './utils/platform';
export * from './utils/storage';
export * from './utils/audio';
export * from './utils/chordUtils';

// Export services
export * from './services/firebase';
export * from './services/progressionService';
export * from './services/favoriteService';
// Re-export reportService with specific exports to avoid name conflicts
import { 
  reportProgression as reportProgressionService,
  getReportsForProgression
} from './services/reportService';
export { reportProgressionService, getReportsForProgression };

// Export hooks
export * from './hooks/useFavorites';
export * from './hooks/useProgression';
export * from './hooks/useProgressionNavigation';
export * from './hooks/useSwipe';

// This file will expand to export more shared code as it's created