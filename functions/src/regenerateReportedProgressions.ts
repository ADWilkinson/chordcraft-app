import * as admin from 'firebase-admin';
import { generateChordProgressionWithAI } from './openai';
import { logger } from 'firebase-functions';
import { onSchedule, ScheduleOptions } from 'firebase-functions/v2/scheduler';

const PROGRESSIONS_COLLECTION = 'progressions';
const REPORTS_COLLECTION = 'reports';

/**
 * Cloud function to regenerate reported progressions
 * Runs on a schedule (once per day)
 */
export const regenerateReportedProgressions = onSchedule({
  schedule: '0 0 * * *', // Run at midnight every day
  timeZone: 'America/New_York',
  memory: '512MiB',
  region: 'us-central1'
} as ScheduleOptions, async (event) => {
    try {
      const db = admin.firestore();
      
      // Get all pending reports
      const reportsSnapshot = await db
        .collection(REPORTS_COLLECTION)
        .where('status', '==', 'pending')
        .get();
      
      if (reportsSnapshot.empty) {
        logger.info('No pending reports found');
        return;
      }
      
      logger.info(`Found ${reportsSnapshot.size} pending reports to process`);
      
      // Group reports by progression ID to avoid regenerating the same progression multiple times
      const progressionReports = new Map<string, admin.firestore.QueryDocumentSnapshot[]>();
      
      reportsSnapshot.forEach(reportDoc => {
        const data = reportDoc.data();
        const progressionId = data.progressionId;
        
        if (!progressionReports.has(progressionId)) {
          progressionReports.set(progressionId, []);
        }
        
        progressionReports.get(progressionId)!.push(reportDoc);
      });
      
      // Process each reported progression
      for (const [progressionId, reports] of progressionReports.entries()) {
        logger.info(`Processing progression ${progressionId} with ${reports.length} reports`);
        
        try {
          // Get the progression document
          const progressionDoc = await db.collection(PROGRESSIONS_COLLECTION).doc(progressionId).get();
          
          if (!progressionDoc.exists) {
            logger.warn(`Progression ${progressionId} not found, skipping`);
            continue;
          }
          
          const progressionData = progressionDoc.data()!;
          
          // Extract generation parameters
          const params = {
            key: progressionData.key,
            scale: progressionData.scale,
            mood: progressionData.mood,
            style: progressionData.style,
            startingChord: progressionData.startingChord
          };
          
          // Generate a new progression
          logger.info(`Regenerating progression with params:`, params);
          const newProgression = await generateChordProgressionWithAI(params);
          
          // Update the progression document with new data
          await progressionDoc.ref.update({
            chords: newProgression.chords,
            insights: newProgression.insights,
            numerals: newProgression.numerals || [],
            reported: false,
            reportReason: null,
            reportedAt: null,
            regeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
            regenerationCount: admin.firestore.FieldValue.increment(1)
          });
          
          // Update all reports for this progression
          const batch = db.batch();
          reports.forEach(reportDoc => {
            batch.update(reportDoc.ref, {
              status: 'regenerated',
              resolvedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          });
          
          await batch.commit();
          logger.info(`Successfully regenerated progression ${progressionId}`);
        } catch (error) {
          logger.error(`Error regenerating progression ${progressionId}:`, error);
          // Continue with the next progression even if this one fails
        }
      }
      
      logger.info('Finished regenerating reported progressions');
      return;
    } catch (error) {
      logger.error('Error in regenerateReportedProgressions function:', error);
      throw error;
    }
  });
