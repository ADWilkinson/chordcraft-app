import { db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc, increment, doc, query, where, getDocs } from 'firebase/firestore';
// Removed unused import

// Define the interface for report data
export interface ReportData {
  progressionId: string;
  reason: string;
  details?: string;
  timestamp?: any;
}

// Collection names
const REPORTS_COLLECTION = 'reports';
const PROGRESSIONS_COLLECTION = 'progressions';

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
    await addDoc(collection(db, REPORTS_COLLECTION), reportData);

    // Increment the flags count on the progression
    const progressionRef = doc(db, PROGRESSIONS_COLLECTION, progressionId);
    await updateDoc(progressionRef, {
      flags: increment(1),
      reported: true,
      reportReason: reason,
      reportedAt: serverTimestamp()
    });

    console.log('Report submitted successfully');
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

/**
 * Get all reports for a specific progression
 * @param progressionId - The ID of the progression to get reports for
 * @returns Promise that resolves with the reports
 */
export const getReportsForProgression = async (progressionId: string): Promise<ReportData[]> => {
  try {
    const reportsQuery = query(
      collection(db, REPORTS_COLLECTION),
      where('progressionId', '==', progressionId)
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    const reports: ReportData[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push(doc.data() as ReportData);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};