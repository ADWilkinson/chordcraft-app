/**
 * Script to seed the database with chord progressions using OpenAI
 * Run with: npx ts-node src/seed-progressions.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { generateChordProgressionWithAI } from './openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin with project ID
initializeApp({
  projectId: 'chordcraft-app'
});

const db = getFirestore();

// Define the parameters for generating progressions
const keysToGenerate = ["C", "G", "D", "A", "E", "F", "Bb"];
const scalesToGenerate = ["major", "minor", "dorian", "mixolydian"];
const moodsToGenerate = ["happy", "sad", "energetic", "relaxed", "dramatic"];
const stylesToGenerate = ["pop", "rock", "jazz", "folk", "classical", "electronic"];

// Type definitions
interface ChordProgression {
  key: string;
  scale: string;
  chords: string[];
  mood: string;
  style: string;
  insights: string[];
  createdAt: FirebaseFirestore.Timestamp;
  likes: number;
  flags: number;
}

/**
 * Generate a chord progression with AI
 */
async function generateProgressionWithAI(
  key: string, 
  scale: string, 
  mood: string, 
  style: string, 
  startingChord?: string
): Promise<Omit<ChordProgression, 'id'>> {
  // Create a prompt based on the parameters
  const params = {
    key,
    scale,
    mood,
    style,
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
      createdAt: FirebaseFirestore.Timestamp.now(),
      likes: 0,
      flags: 0
    };
  } catch (error) {
    logger.error("Error generating with AI", error);
    throw error;
  }
}

/**
 * Seed the database with chord progressions
 */
async function seedProgressions() {
  try {
    console.log('Starting to seed progressions...');
    
    // Generate a batch of progressions with different combinations
    let batch = db.batch();
    let count = 0;
    let totalCount = 0;
    const batchSize = 10; // Keep batches small to avoid timeouts
    
    // Generate a limited set of combinations
    for (const key of keysToGenerate) {
      for (const scale of scalesToGenerate) {
        for (const mood of moodsToGenerate) {
          // Only generate for a subset of styles to limit the number of combinations
          const style = stylesToGenerate[Math.floor(Math.random() * stylesToGenerate.length)];
          
          try {
            console.log(`Generating progression for ${key} ${scale} ${mood} ${style}...`);
            
            // Generate progression
            const progression = await generateProgressionWithAI(key, scale, mood, style);
            
            // Create a document reference with a unique ID
            const docRef = db.collection("progressions").doc();
            
            // Add to batch
            batch.set(docRef, progression);
            count++;
            totalCount++;
            
            // Commit in batches to avoid timeouts
            if (count >= batchSize) {
              console.log(`Committing batch of ${count} progressions...`);
              await batch.commit();
              batch = db.batch();
              count = 0;
              
              // Add a small delay between batches to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Add a small delay between API calls to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to generate progression for ${key} ${scale} ${mood} ${style}`, error);
          }
        }
      }
    }
    
    // Commit any remaining progressions
    if (count > 0) {
      console.log(`Committing final batch of ${count} progressions...`);
      await batch.commit();
    }
    
    console.log(`Successfully generated ${totalCount} new chord progressions.`);
  } catch (error) {
    console.error('Error in seedProgressions:', error);
    throw error;
  }
}

// Run the seeding process
seedProgressions()
  .then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
