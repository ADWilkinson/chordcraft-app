import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, increment, doc } from 'firebase/firestore';

interface ReportData {
  progressionId: string;
  reason: string;
  details?: string;
  timestamp?: any;
}

/**
 * Submit a report for a progression
 * @param progressionId - The ID of the progression to report
 * @param reason - The reason for reporting
 * @param details - Additional details about the report
 * @returns Promise that resolves when the report is submitted
 */
export const reportProgression = async (
  progressionId: string,
  reason: string,
  details: string = ''
): Promise<void> => {
  try {
    // Create the report document
    const reportData: ReportData = {
      progressionId,
      reason,
      details,
      timestamp: serverTimestamp(),
    };

    // Add the report to the reports collection
    await addDoc(collection(db, 'reports'), reportData);

    // Increment the flags count on the progression
    const progressionRef = doc(db, 'progressions', progressionId);
    await updateDoc(progressionRef, {
      flags: increment(1),
    });

    console.log('Report submitted successfully');
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

/**
 * Get all reports for a specific progression
 * This would be used in an admin dashboard
 * @param progressionId - The ID of the progression to get reports for
 * @returns Promise that resolves with the reports
 */
export const getReportsForProgression = async (progressionId: string) => {
  // This would be implemented for an admin dashboard
  // Not needed for the current user-facing functionality
  console.log('Getting reports for progression:', progressionId);
};
