#!/usr/bin/env node

/**
 * ChordCraft - Database Seeding Script
 * 
 * This script allows developers to seed the database with chord progressions
 * for testing and development purposes.
 * 
 * Usage:
 *   node seed-database.js --count 10                # Generate 10 random progressions
 *   node seed-database.js --clear                   # Clear all progressions
 *   node seed-database.js --clear-reports           # Clear all reports
 *   node seed-database.js --count 5 --key C         # Generate 5 progressions in C key
 *   node seed-database.js --count 5 --scale minor   # Generate 5 progressions in minor scale
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'c',
    description: 'Number of progressions to generate',
    type: 'number',
    default: 10
  })
  .option('key', {
    alias: 'k',
    description: 'Music key (e.g., C, D, E)',
    type: 'string',
  })
  .option('scale', {
    alias: 's',
    description: 'Scale (e.g., major, minor)',
    type: 'string',
  })
  .option('mood', {
    alias: 'm',
    description: 'Mood (e.g., happy, sad, energetic)',
    type: 'string',
  })
  .option('style', {
    alias: 'st',
    description: 'Music style (e.g., pop, rock, jazz)',
    type: 'string',
  })
  .option('clear', {
    description: 'Clear all progressions from the database',
    type: 'boolean',
  })
  .option('clear-reports', {
    description: 'Clear all reports from the database',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  console.error('Please create a service-account.json file in the project root.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Collection names
const PROGRESSIONS_COLLECTION = 'progressions';
const REPORTS_COLLECTION = 'reports';

// Music keys, scales, moods, and styles for random generation
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const scales = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian'];
const moods = ['happy', 'sad', 'energetic', 'relaxed', 'dramatic', 'melancholic', 'triumphant'];
const styles = ['pop', 'rock', 'jazz', 'blues', 'folk', 'classical', 'electronic', 'country'];

// Helper function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Create a prompt for generating a chord progression
function createChordProgressionPrompt(params) {
  const { key, scale, mood, style } = params;
  
  let prompt = `Generate a high-quality chord progression in ${key || "any key"} ${scale || "scale"} with a ${mood || "any mood"} mood in the style of ${style || "any style"} music.`;
  
  prompt += `\n\nRequirements:
1. The progression MUST have at least 4 chords, preferably 6-8 chords for more musical interest
2. Provide at least 3 detailed musical insights about the progression
3. Each insight should be at least 2 sentences long and explain the music theory behind the progression
4. Include Roman numeral analysis for each chord in the progression

Respond with a JSON object containing:
1. An array of chords (at least 4 chords, preferably 6-8) named "chords"
2. An array of detailed musical insights (at least 3 items) about the progression named "insights"
3. An array of Roman numeral analysis for each chord named "numerals"

Example response format:
{
  "chords": ["C", "Am", "F", "G", "Em", "F", "G", "C"],
  "numerals": ["I", "vi", "IV", "V", "iii", "IV", "V", "I"],
  "insights": [
    "This progression follows a I-vi-IV-V pattern in the first half, which is common in pop and rock music. The second half introduces the iii chord for added emotional depth before resolving back to the tonic.",
    "The movement from C to Am creates a smooth transition between relative major and minor, creating a bittersweet feeling. This is enhanced by the later use of Em which reinforces the minor quality.",
    "The F to G resolution creates tension that resolves back to C, forming a perfect authentic cadence (IV-V-I). This strong resolution gives the progression a sense of completion and satisfaction."
  ]
}`;
  
  return prompt;
}

// Generate a chord progression using OpenAI
async function generateChordProgression(params) {
  try {
    // Create a prompt for the AI
    const prompt = createChordProgressionPrompt(params);
    
    // Call the OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a music theory expert specializing in chord progressions. Respond only with valid JSON that meets all the requirements in the user's prompt." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });
    
    // Extract the response content
    const content = response.data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Validate the response structure
      if (!parsedResponse.chords || !parsedResponse.insights) {
        throw new Error("Invalid response format from OpenAI");
      }
      
      return {
        chords: parsedResponse.chords,
        insights: parsedResponse.insights,
        numerals: parsedResponse.numerals || [],
        key: params.key || getRandomItem(keys),
        scale: params.scale || getRandomItem(scales),
        mood: params.mood || getRandomItem(moods),
        style: params.style || getRandomItem(styles),
        createdAt: new Date(),
        likes: 0,
        flags: 0,
        qualityScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      };
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse OpenAI response");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Clear all progressions from the database
async function clearProgressions() {
  try {
    const progressionsRef = db.collection(PROGRESSIONS_COLLECTION);
    const snapshot = await progressionsRef.get();
    
    if (snapshot.empty) {
      console.log('No progressions to delete.');
      return;
    }
    
    console.log(`Deleting ${snapshot.size} progressions...`);
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('All progressions deleted successfully.');
  } catch (error) {
    console.error('Error clearing progressions:', error);
  }
}

// Clear all reports from the database
async function clearReports() {
  try {
    const reportsRef = db.collection(REPORTS_COLLECTION);
    const snapshot = await reportsRef.get();
    
    if (snapshot.empty) {
      console.log('No reports to delete.');
      return;
    }
    
    console.log(`Deleting ${snapshot.size} reports...`);
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Also update all progressions to remove reported flag
    const progressionsRef = db.collection(PROGRESSIONS_COLLECTION);
    const progressionsSnapshot = await progressionsRef.where('reported', '==', true).get();
    
    if (!progressionsSnapshot.empty) {
      console.log(`Updating ${progressionsSnapshot.size} reported progressions...`);
      
      const batch = db.batch();
      progressionsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          reported: false,
          reportReason: null,
          reportedAt: null
        });
      });
      
      await batch.commit();
    }
    
    console.log('All reports cleared successfully.');
  } catch (error) {
    console.error('Error clearing reports:', error);
  }
}

// Seed the database with chord progressions
async function seedDatabase() {
  try {
    const count = argv.count;
    
    // Create parameters object
    const params = {
      key: argv.key,
      scale: argv.scale,
      mood: argv.mood,
      style: argv.style
    };
    
    // Filter out undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    
    console.log(`Generating ${count} progressions with parameters:`, params);
    
    // Generate and save progressions
    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating progression ${i + 1}/${count}...`);
        
        // Generate progression
        const progression = await generateChordProgression(params);
        
        // Save to Firestore
        await db.collection(PROGRESSIONS_COLLECTION).add(progression);
        
        console.log(`Progression ${i + 1}/${count} saved successfully.`);
      } catch (error) {
        console.error(`Error generating progression ${i + 1}/${count}:`, error);
      }
      
      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Main function
async function main() {
  if (argv.clear) {
    await clearProgressions();
  } else if (argv['clear-reports']) {
    await clearReports();
  } else {
    await seedDatabase();
  }
  
  process.exit(0);
}

main();
