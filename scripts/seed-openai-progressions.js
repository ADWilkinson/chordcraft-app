/**
 * ChordCraft - OpenAI Progression Seeder
 * 
 * This script seeds the Firestore database with chord progressions generated using OpenAI.
 * It uses the Firebase Admin SDK with service account credentials.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../functions/.env') });

// Initialize Firebase Admin with service account
const serviceAccountPath = path.resolve(__dirname, '../functions/service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the parameters for generating progressions
const keysToGenerate = ["C", "G", "D", "A", "E", "F", "Bb"];
const scalesToGenerate = ["major", "minor", "dorian", "mixolydian"];
const moodsToGenerate = ["happy", "sad", "energetic", "relaxed", "dramatic"];
const stylesToGenerate = ["pop", "rock", "jazz", "folk", "classical", "electronic"];

/**
 * Generate a chord progression with OpenAI
 */
async function generateProgressionWithAI(key, scale, mood, style, startingChord = "") {
  try {
    console.log(`Generating progression for ${key} ${scale} ${mood} ${style}...`);
    
    // Create a prompt for OpenAI
    const prompt = `Generate a chord progression in ${key} ${scale} that sounds ${mood} in the style of ${style} music.${startingChord ? ` Start with the chord ${startingChord}.` : ''}
    
    Respond with ONLY a JSON object with the following format:
    {
      "chords": ["chord1", "chord2", "chord3", "chord4"],
      "insights": ["insight1", "insight2", "insight3"]
    }
    
    The chords should be formatted as standard chord symbols (e.g., "Cmaj7", "Dm7", "G7", etc.).
    The insights should be brief musical explanations of why the progression works.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a music theory expert who creates chord progressions." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    // Parse the response
    const content = response.choices[0].message.content.trim();
    let result;
    
    try {
      // First try direct JSON parsing
      result = JSON.parse(content);
    } catch (e) {
      console.log("Direct JSON parsing failed, trying to extract JSON from text");
      console.log("Response content:", content);
      
      try {
        // Try to extract JSON with regex - look for anything that looks like JSON
        const jsonRegex = /{[\s\S]*}/;
        const match = content.match(jsonRegex);
        
        if (match) {
          const jsonString = match[0];
          console.log("Extracted JSON string:", jsonString);
          result = JSON.parse(jsonString);
        } else {
          // If no JSON-like structure is found, create a simple fallback
          console.log("No JSON structure found in response, using fallback");
          result = {
            chords: getFallbackChords(key, scale, mood),
            insights: ["This is a standard progression in this key and scale."]
          };
        }
      } catch (innerError) {
        console.error("Error extracting JSON:", innerError);
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    }
    
    // Validate the result
    if (!result.chords || !Array.isArray(result.chords) || result.chords.length === 0) {
      throw new Error("Invalid chord progression in response");
    }
    
    if (!result.insights || !Array.isArray(result.insights) || result.insights.length === 0) {
      result.insights = ["This progression follows common patterns in this style of music."];
    }
    
    return {
      key,
      scale,
      mood,
      style,
      chords: result.chords,
      insights: result.insights,
      createdAt: admin.firestore.Timestamp.now(),
      likes: 0,
      flags: 0
    };
  } catch (error) {
    console.error(`Error generating progression with OpenAI:`, error);
    
    // Return a fallback progression
    return {
      key,
      scale,
      mood,
      style,
      chords: getFallbackChords(key, scale, mood),
      insights: ["This is a standard progression in this key and scale."],
      createdAt: admin.firestore.Timestamp.now(),
      likes: 0,
      flags: 0
    };
  }
}

/**
 * Get fallback chords in case OpenAI fails
 */
function getFallbackChords(key, scale, mood) {
  // Simple fallback progressions based on mood and scale
  const fallbacks = {
    major: {
      happy: [`${key}`, `${key}maj7`, `${key}6`, `${key}add9`],
      sad: [`${key}m`, `${key}m7`, `${key}m9`, `${key}m11`],
      energetic: [`${key}`, `${key}sus4`, `${key}`, `${key}7`],
      relaxed: [`${key}maj7`, `${key}6/9`, `${key}maj9`, `${key}maj13`],
      dramatic: [`${key}m`, `${key}dim`, `${key}m7b5`, `${key}7b9`]
    },
    minor: {
      happy: [`${key}m`, `${key}m6`, `${key}m7`, `${key}m9`],
      sad: [`${key}m`, `${key}m7`, `${key}m9`, `${key}m11`],
      energetic: [`${key}m`, `${key}m7`, `${key}m`, `${key}7`],
      relaxed: [`${key}m7`, `${key}m9`, `${key}m11`, `${key}m13`],
      dramatic: [`${key}m`, `${key}dim`, `${key}m7b5`, `${key}7b9`]
    }
  };
  
  // Default to major if scale is not found
  const scaleType = scale.includes('minor') || scale === 'dorian' ? 'minor' : 'major';
  
  // Default to happy if mood is not found
  const moodType = fallbacks[scaleType][mood] ? mood : 'happy';
  
  return fallbacks[scaleType][moodType];
}

/**
 * Seed the database with chord progressions
 */
async function seedProgressions(count = 20) {
  try {
    console.log(`Starting to seed ${count} progressions...`);
    
    // Generate a batch of progressions with different combinations
    let batch = db.batch();
    let batchCount = 0;
    let totalCount = 0;
    const batchSize = 5; // Keep batches small to avoid timeouts
    
    // Generate progressions with different combinations
    const combinations = [];
    
    // Create combinations of parameters
    for (const key of keysToGenerate) {
      for (const scale of scalesToGenerate) {
        for (const mood of moodsToGenerate) {
          // Only use a subset of styles to limit the number of combinations
          const style = stylesToGenerate[Math.floor(Math.random() * stylesToGenerate.length)];
          combinations.push({ key, scale, mood, style });
        }
      }
    }
    
    // Shuffle the combinations
    const shuffled = combinations.sort(() => 0.5 - Math.random());
    
    // Take only the number of combinations we need
    const selectedCombinations = shuffled.slice(0, count);
    
    // Generate progressions for each combination
    for (const { key, scale, mood, style } of selectedCombinations) {
      try {
        // Generate progression
        const progression = await generateProgressionWithAI(key, scale, mood, style);
        
        // Create a document reference with a unique ID
        const docRef = db.collection("progressions").doc();
        
        // Add to batch
        batch.set(docRef, progression);
        batchCount++;
        totalCount++;
        
        console.log(`Added progression ${totalCount}/${count}: ${key} ${scale} ${mood} ${style}`);
        
        // Commit in batches to avoid timeouts
        if (batchCount >= batchSize) {
          console.log(`Committing batch of ${batchCount} progressions...`);
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
          
          // Add a small delay between batches to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Add a small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to generate progression for ${key} ${scale} ${mood} ${style}`, error);
      }
    }
    
    // Commit any remaining progressions
    if (batchCount > 0) {
      console.log(`Committing final batch of ${batchCount} progressions...`);
      await batch.commit();
    }
    
    console.log(`Successfully generated ${totalCount} new chord progressions.`);
  } catch (error) {
    console.error('Error in seedProgressions:', error);
    throw error;
  }
}

// Run the seeding process
seedProgressions(30)
  .then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
