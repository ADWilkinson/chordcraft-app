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
import * as dotenv from 'dotenv';

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
export const generateChordProgression = onCall<GenerationParams>({ 
  timeoutSeconds: 60, // Increase timeout to 60 seconds for OpenAI API calls
  memory: "256MiB" // Increase memory allocation
}, async (request) => {
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
        ...progression
      }
    };
  } catch (error) {
    logger.error("Error generating chord progression", error);
    throw new Error("Failed to generate chord progression");
  }
});

/**
 * Schedule function to generate new chord progressions daily
 */
export const generateDailyProgressions = onSchedule({ 
  schedule: "every 24 hours", 
  timeoutSeconds: 540, // 9 minutes timeout for batch processing
  memory: "512MiB" // Increase memory for batch processing
}, async (event: ScheduledEvent) => {
  try {
    logger.info("Generating daily chord progressions");
    
    // Define a set of parameters to generate progressions for
    const keysToGenerate = ["C", "G", "D", "A", "E", "F"];
    const scalesToGenerate = ["major", "minor", "dorian", "mixolydian"];
    const moodsToGenerate = ["happy", "sad", "energetic", "relaxed", "dramatic"];
    const stylesToGenerate = ["pop", "rock", "jazz", "folk", "classical"];
    
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
          await new Promise(resolve => setTimeout(resolve, 500));
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
});

/**
 * Helper function to generate a chord progression with AI
 */
async function generateProgressionWithAI(
  key?: string, 
  scale?: string, 
  mood?: string, 
  style?: string, 
  startingChord?: string
): Promise<Omit<ChordProgression, 'id'>> {
  // Create a prompt based on the parameters
  const params = {
    key: key || "C",
    scale: scale || "major",
    mood: mood || "happy",
    style: style || "pop",
    startingChord: startingChord || ""
  };
  
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
      flags: 0
    };
  } catch (error) {
    logger.error("Error generating with AI", error);
    throw error;
  }
}
