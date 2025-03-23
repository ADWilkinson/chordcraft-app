/**
 * Platform detection utilities for cross-platform compatibility
 */

// Check if we're running in a web environment
export const isPlatformWeb = () => typeof document !== 'undefined';

// Check if we're running in a React Native environment
export const isPlatformMobile = () => !isPlatformWeb();

// Check for specific mobile platforms (only works in React Native)
export const isPlatformIOS = () => {
  if (isPlatformWeb()) return false;
  
  try {
    // Dynamic import to avoid errors on web
    const { Platform } = require('react-native');
    return Platform.OS === 'ios';
  } catch (error) {
    return false;
  }
};

export const isPlatformAndroid = () => {
  if (isPlatformWeb()) return false;
  
  try {
    // Dynamic import to avoid errors on web
    const { Platform } = require('react-native');
    return Platform.OS === 'android';
  } catch (error) {
    return false;
  }
};