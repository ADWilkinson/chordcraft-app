/**
 * Utility functions for formatting various data types in the application
 */

/**
 * Format scale name for display
 * @param scale - The scale name to format
 * @returns Formatted scale name
 */
export const formatScaleName = (scale: string): string => {
  if (!scale) return '';
  
  // Replace underscores with spaces
  let formattedScale = scale.replace(/_/g, ' ');
  
  // Capitalize the first letter of each word
  formattedScale = formattedScale
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formattedScale;
};

/**
 * Format a date object or firebase timestamp for display
 * @param timestamp - The timestamp to format (can be Date, Firestore Timestamp, or ServerTimestamp)
 * @returns Formatted date string
 */
export const formatTimestamp = (
  timestamp: Date | { toDate: () => Date } | { seconds: number; nanoseconds: number } | any
): string => {
  if (!timestamp) return '';
  
  let date: Date;
  
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date();
  }
  
  return date.toLocaleDateString();
};