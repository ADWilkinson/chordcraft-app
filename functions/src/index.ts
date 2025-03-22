/**
 * ChordCraft App - Firebase Cloud Functions
 *
 * These functions power the AI chord progression generation for ChordCraft.
 */

import { onCall } from "firebase-functions/v2/https";
import { onSchedule, ScheduledEvent } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { generateChordProgressionWithAI } from "./openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Type definitions
interface ChordProgression {
  key: string;
  scale: string;
  chords: string[];
  mood: string;
  style: string;
  insights: string[];
  createdAt: Timestamp;
  likes: number;
  flags: number;
  qualityChecked?: boolean;
  qualityCheckDate?: Timestamp;
  qualityIssues?: string[];
  qualityScore?: number;
  reported?: boolean;
  reportReason?: string;
  reportedAt?: Timestamp;
  regeneratedAt?: Timestamp;
}

interface GenerationParams {
  key?: string;
  scale?: string;
  mood?: string;
  style?: string;
  startingChord?: string;
}

/**
 * Generate a chord progression based on the provided parameters
 */
export const generateChordProgression = onCall<GenerationParams>(
  {
    timeoutSeconds: 60, // Increase timeout to 60 seconds for OpenAI API calls
    memory: "256MiB", // Increase memory allocation
  },
  async (request) => {
    try {
      // Log the request
      logger.info("Generating chord progression", request.data);

      // Extract parameters
      const { key, scale, mood, style, startingChord } = request.data || {};

      // Generate a chord progression using AI
      const progression = await generateProgressionWithAI(key, scale, mood, style, startingChord);

      // Save to Firestore
      const docRef = await db.collection("progressions").add(progression);

      // Return the progression with the document ID
      return {
        progression: {
          id: docRef.id,
          ...progression,
        },
      };
    } catch (error) {
      logger.error("Error generating chord progression", error);
      throw new Error("Failed to generate chord progression");
    }
  }
);

/**
 * Schedule function to generate new chord progressions daily
 */
export const generateDailyProgressions = onSchedule(
  {
    schedule: "every 24 hours",
    timeoutSeconds: 540, // 9 minutes timeout for batch processing
    memory: "512MiB", // Increase memory for batch processing
  },
  async (event: ScheduledEvent) => {
    try {
      logger.info("Generating daily chord progressions");

      // Define a set of parameters to generate progressions for
      const keysToGenerate = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

      const scalesToGenerate = ["major", "minor", "dorian", "lydian", "mixolydian", "harmonic minor", "melodic minor"];

      const moodsToGenerate = [
        "happy",
        "sad",
        "relaxed",
        "dramatic",
        "energetic",
        "melancholic",
        "romantic",
        "contemplative",
        "grand",
        "intimate",
      ];

      const stylesToGenerate = [
        "classical",
        "jazz",
        "pop",
        "rock",
        "impressionist",
        "romantic",
        "minimalist",
        "contemporary",
        "ballad",
      ];

      // Generate a batch of progressions with different combinations
      const batch = db.batch();
      let count = 0;

      // Generate a limited set of combinations to avoid excessive API usage
      for (const key of keysToGenerate) {
        for (const scale of scalesToGenerate) {
          // Only generate for a subset of moods and styles to limit the number of combinations
          const mood = moodsToGenerate[Math.floor(Math.random() * moodsToGenerate.length)];
          const style = stylesToGenerate[Math.floor(Math.random() * stylesToGenerate.length)];

          try {
            // Generate progression
            const progression = await generateProgressionWithAI(key, scale, mood, style);

            // Create a document reference with a unique ID
            const docRef = db.collection("progressions").doc();

            // Add to batch
            batch.set(docRef, progression);
            count++;

            // Commit in batches of 10 to avoid timeouts
            if (count % 10 === 0) {
              await batch.commit();
              logger.info(`Committed batch of ${count} progressions`);
            }

            // Add a small delay between API calls to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Failed to generate progression for ${key} ${scale} ${mood} ${style}`, error);
          }
        }
      }

      // Commit any remaining progressions
      if (count % 10 !== 0) {
        await batch.commit();
      }

      logger.info(`Generated ${count} new chord progressions`);
    } catch (error) {
      logger.error("Error in generateDailyProgressions", error);
      throw error;
    }
  }
);

/**
 * Schedule function to regenerate reported progressions
 */
export const regenerateReportedProgressions = onSchedule(
  {
    schedule: "every 24 hours",
    timeoutSeconds: 300, // 5 minutes timeout
    memory: "512MiB",
  },
  async (event: ScheduledEvent) => {
    try {
      logger.info("Checking for reported progressions to regenerate");

      // Query for reports that need regeneration
      const pendingReportsQuery = db
        .collection("reports")
        .where("status", "==", "pending")
        .orderBy("createdAt", "asc")
        .limit(10); // Process in batches of 10

      const pendingReportsSnapshot = await pendingReportsQuery.get();

      if (pendingReportsSnapshot.empty) {
        logger.info("No pending reports to process");
        return;
      }

      logger.info(`Found ${pendingReportsSnapshot.size} reported progressions to regenerate`);

      // Process each report
      for (const reportDoc of pendingReportsSnapshot.docs) {
        const report = reportDoc.data();
        const progressionId = report.progressionId;

        try {
          // Get the original progression
          const progressionRef = db.collection("progressions").doc(progressionId);
          const progressionDoc = await progressionRef.get();

          if (!progressionDoc.exists) {
            logger.warn(`Progression ${progressionId} not found, marking report as dismissed`);
            await reportDoc.ref.update({
              status: "dismissed",
              resolvedAt: Timestamp.now(),
              notes: "Progression not found",
            });
            continue;
          }

          const progression = progressionDoc.data() as ChordProgression;

          // Generate a new progression with the same parameters
          logger.info(
            `Regenerating progression ${progressionId} with params: ${progression.key} ${progression.scale} ${progression.mood} ${progression.style}`
          );

          const newProgression = await generateProgressionWithAI(
            progression.key,
            progression.scale,
            progression.mood,
            progression.style
          );

          // Update the original progression with new content
          await progressionRef.update({
            chords: newProgression.chords,
            insights: newProgression.insights,
            reported: false,
            reportReason: null,
            reportedAt: null,
            regeneratedAt: Timestamp.now(),
          });

          // Update the report status
          await reportDoc.ref.update({
            status: "regenerated",
            resolvedAt: Timestamp.now(),
          });

          logger.info(`Successfully regenerated progression ${progressionId}`);
        } catch (error: any) {
          logger.error(`Error regenerating progression ${progressionId}:`, error);

          // Mark the report as failed but don't retry immediately
          await reportDoc.ref.update({
            status: "failed",
            error: error.message || "Unknown error",
            lastAttempt: Timestamp.now(),
          });
        }

        // Add a small delay between API calls to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      logger.info("Completed regeneration of reported progressions");
    } catch (error) {
      logger.error("Error in regenerateReportedProgressions:", error);
      throw error;
    }
  }
);

/**
 * Function to validate a progression's quality
 */
export const validateProgressionQuality = onCall<{ progressionId: string }>(
  {
    timeoutSeconds: 30,
  },
  async (request) => {
    try {
      const { progressionId } = request.data;

      if (!progressionId) {
        throw new Error("Progression ID is required");
      }

      // Get the progression
      const progressionRef = db.collection("progressions").doc(progressionId);
      const progressionDoc = await progressionRef.get();

      if (!progressionDoc.exists) {
        throw new Error("Progression not found");
      }

      const progression = progressionDoc.data() as ChordProgression;

      // Check quality criteria
      const qualityIssues = [];

      // Check chord count
      if (!progression.chords || progression.chords.length < 4) {
        qualityIssues.push("Insufficient chord count (minimum 6 required)");
      }

      // Check insights count
      if (!progression.insights || progression.insights.length < 3) {
        qualityIssues.push("Insufficient insights (minimum 3 required)");
      }

      // Check insight quality
      if (progression.insights) {
        const shortInsights = progression.insights.filter((insight) => insight.length < 100);
        if (shortInsights.length > 0) {
          qualityIssues.push("Some insights are too short (minimum 100 characters required)");
        }
      }

      // Update progression with quality check results
      await progressionRef.update({
        qualityChecked: true,
        qualityCheckDate: Timestamp.now(),
        qualityIssues: qualityIssues.length > 0 ? qualityIssues : null,
        qualityScore: calculateQualityScore(progression, qualityIssues),
      });

      return {
        progressionId,
        qualityIssues,
        passedQualityCheck: qualityIssues.length === 0,
      };
    } catch (error) {
      logger.error("Error validating progression quality:", error);
      throw new Error("Failed to validate progression quality");
    }
  }
);

/**
 * Calculate a quality score for a progression
 */
function calculateQualityScore(progression: ChordProgression, issues: string[]): number {
  let score = 100; // Start with perfect score

  // Deduct points for each issue
  if (issues.length > 0) {
    score -= issues.length * 20; // Deduct 20 points per issue
  }

  // Bonus points for longer progressions (up to +10)
  if (progression.chords && progression.chords.length > 8) {
    score += Math.min((progression.chords.length - 8) * 2, 10);
  }

  // Bonus points for more insights (up to +10)
  if (progression.insights && progression.insights.length > 3) {
    score += Math.min((progression.insights.length - 3) * 3, 10);
  }

  // Bonus points for detailed insights (up to +10)
  if (progression.insights) {
    const avgLength =
      progression.insights.reduce((sum, insight) => sum + insight.length, 0) / progression.insights.length;
    if (avgLength > 150) {
      score += Math.min((avgLength - 150) / 10, 10);
    }
  }

  // Cap score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Helper function to generate a chord progression with AI
 */
async function generateProgressionWithAI(
  key?: string,
  scale?: string,
  mood?: string,
  style?: string,
  startingChord?: string
): Promise<Omit<ChordProgression, "id">> {
  // Define possible options for random selection
  const possibleKeys = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

  const possibleScales = ["major", "minor", "dorian", "lydian", "mixolydian", "harmonic minor", "melodic minor"];

  const possibleMoods = [
    "happy",
    "sad",
    "relaxed",
    "dramatic",
    "energetic",
    "melancholic",
    "romantic",
    "contemplative",
    "grand",
    "intimate",
  ];

  const possibleStyles = [
    "classical",
    "jazz",
    "pop",
    "rock",
    "impressionist",
    "romantic",
    "minimalist",
    "contemporary",
    "ballad",
  ];

  // Create a prompt based on the parameters - fixed to handle undefined, null, and empty strings
  const params = {
    key: (!key || key === "") ? possibleKeys[Math.floor(Math.random() * possibleKeys.length)] : key,
    scale: (!scale || scale === "") ? possibleScales[Math.floor(Math.random() * possibleScales.length)] : scale,
    mood: (!mood || mood === "") ? possibleMoods[Math.floor(Math.random() * possibleMoods.length)] : mood,
    style: (!style || style === "") ? possibleStyles[Math.floor(Math.random() * possibleStyles.length)] : style,
    startingChord: startingChord || "",
  };

  // Adjust scale if starting chord is minor but scale is major
  if (
    params.startingChord &&
    params.startingChord.endsWith("m") &&
    !params.startingChord.includes("maj") &&
    params.scale.toLowerCase() === "major"
  ) {
    params.scale = "minor";
  }

  try {
    // Generate a chord progression using OpenAI
    const result = await generateChordProgressionWithAI(params);

    // Return the progression
    return {
      key: params.key,
      scale: params.scale,
      mood: params.mood,
      style: params.style,
      chords: result.chords,
      insights: result.insights,
      createdAt: Timestamp.now(),
      likes: 0,
      flags: 0,
    };
  } catch (error) {
    logger.error("Error generating with AI", error);
    throw error;
  }
}
