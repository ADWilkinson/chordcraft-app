/**
 * Mobile-specific storage implementation using AsyncStorage
 */

let AsyncStorage: any;

// Dynamically import AsyncStorage to avoid issues on web
try {
  // This will throw an error on web
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.error('AsyncStorage not available:', error);
  // Provide fallback methods that do nothing
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
    clear: async () => {},
  };
}

export const getItem = async (key: string): Promise<any> => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from AsyncStorage:', error);
    return null;
  }
};

export const setItem = async (key: string, value: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to AsyncStorage:', error);
    return false;
  }
};

export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from AsyncStorage:', error);
    return false;
  }
};

export const clear = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
    return false;
  }
};