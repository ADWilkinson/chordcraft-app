/**
 * Platform-agnostic audio interface that dynamically selects
 * the appropriate implementation for the current platform
 */

import * as WebAudio from './web';
import * as MobileAudio from './mobile';
import { isPlatformWeb } from '../platform';

// Dynamically choose the right implementation
export const AudioEngine = isPlatformWeb() ? WebAudio : MobileAudio;

// Re-export the methods for convenience
export const initAudio = AudioEngine.initAudio;
export const playChord = AudioEngine.playChord;
export const playProgression = AudioEngine.playProgression;
export const stopAllAudio = AudioEngine.stopAllAudio;

// Export utility functions
// export { getChordNotes } from WebAudio;