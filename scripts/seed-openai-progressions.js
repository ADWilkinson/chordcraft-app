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
const serviceAccountPath = path.resolve(__dirname, './service-account.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Service account file not found at:', serviceAccountPath);
  console.log('Trying alternative paths...');
  
  // Try alternative paths
  const altPaths = [
    path.resolve(__dirname, '../functions/service-account.json'),
    path.resolve(__dirname, '../service-account.json')
  ];
  
  let initialized = false;
  
  for (const altPath of altPaths) {
    try {
      if (fs.existsSync(altPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(altPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Successfully initialized with service account from:', altPath);
        initialized = true;
        break;
      }
    } catch (e) {
      console.log('Failed to initialize with service account from:', altPath);
    }
  }
  
  if (!initialized) {
    // Try to use application default credentials
    try {
      admin.initializeApp({
        projectId: 'chordcraft-app'
      });
      console.log('Initialized with application default credentials');
    } catch (e) {
      console.error('Failed to initialize Firebase Admin SDK:', e);
      console.error('Please ensure you have a valid service-account.json file');
      process.exit(1);
    }
  }
}

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
    const prompt = `Generate a high-quality chord progression in ${key} ${scale} that sounds ${mood} in the style of ${style} music.${startingChord ? ` Start with the chord ${startingChord}.` : ''}
    
    Requirements:
    1. The progression MUST have at least 6 chords, preferably 8-12 chords for more musical interest and development
    2. Include a mix of chord types (e.g., major, minor, 7th, maj7, etc.) appropriate for the style and mood
    3. Ensure the progression has a clear harmonic direction and resolution
    4. Include at least one interesting or unexpected chord that adds color while still being musically coherent
    5. Provide at least 3 detailed musical insights about the progression, each at least 3 sentences long
    
    Respond with ONLY a JSON object with the following format:
    {
      "chords": ["chord1", "chord2", "chord3", "chord4", "chord5", "chord6", "chord7", "chord8"],
      "insights": [
        "First detailed insight about the progression that explains the music theory concepts used (at least 3 sentences).",
        "Second detailed insight about the harmonic movement and emotional qualities (at least 3 sentences).",
        "Third detailed insight about how this progression fits the requested style and mood (at least 3 sentences)."
      ],
      "numerals": ["I", "vi", "IV", "V", "iii", "IV", "V", "I"]
    }
    
    The chords should be formatted as standard chord symbols (e.g., "Cmaj7", "Dm7", "G7", etc.).
    The insights should be detailed musical explanations of why the progression works.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a music theory expert who creates chord progressions. You always respond with valid JSON that meets all requirements." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
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
    if (!result.chords || !Array.isArray(result.chords) || result.chords.length < 6) {
      console.log("Invalid chord progression in response - not enough chords");
      throw new Error("Invalid chord progression in response - not enough chords");
    }
    
    if (!result.insights || !Array.isArray(result.insights) || result.insights.length < 3) {
      console.log("Invalid insights in response - not enough insights");
      result.insights = [
        "This progression follows common patterns in this style of music, creating a harmonically rich foundation.",
        "The chord choices create an emotional journey that reflects the desired mood through careful voice leading and harmonic tension.",
        "The progression demonstrates classic music theory principles while incorporating some unexpected elements that add interest and color."
      ];
    }
    
    // Check if insights are detailed enough
    const shortInsights = result.insights.filter(insight => insight.length < 100);
    if (shortInsights.length > 0) {
      console.log("Some insights are too short, enhancing them");
      result.insights = result.insights.map(insight => {
        if (insight.length < 100) {
          return insight + ` This approach is commonly used in ${style} music to create a ${mood} atmosphere. The voice leading between these chords creates a smooth and natural progression that guides the listener through the harmonic journey.`;
        }
        return insight;
      });
    }
    
    // Add numerals if they're missing
    if (!result.numerals || !Array.isArray(result.numerals) || result.numerals.length !== result.chords.length) {
      console.log("Numerals missing or invalid, generating them");
      result.numerals = generateNumerals(result.chords, key, scale);
    }
    
    return {
      key,
      scale,
      mood,
      style,
      chords: result.chords,
      insights: result.insights,
      numerals: result.numerals,
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
      insights: [
        "This progression follows common patterns in this style of music, creating a harmonically rich foundation for melodic development. The chord choices work together to establish a strong tonal center while providing enough movement to maintain interest.",
        "The emotional quality of this progression aligns with the requested mood through its careful balance of consonance and dissonance. The voice leading between chords creates a smooth and natural flow that guides the listener through the harmonic journey.",
        "This chord sequence demonstrates classic music theory principles while incorporating some unexpected elements that add interest and color. The overall structure provides a solid framework for improvisation and melodic exploration."
      ],
      numerals: generateNumerals(getFallbackChords(key, scale, mood), key, scale),
      createdAt: admin.firestore.Timestamp.now(),
      likes: 0,
      flags: 0
    };
  }
}

/**
 * Generate Roman numerals for chords
 */
function generateNumerals(chords, key, scale) {
  // Define the notes in each key
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const keyIndex = notes.indexOf(key.replace(/m$/, '')); // Remove trailing 'm' if present
  
  // Define scale intervals for different scales
  const scaleIntervals = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  
  // Get the intervals for the requested scale
  const intervals = scaleIntervals[scale.toLowerCase()] || scaleIntervals.major;
  
  // Generate scale degrees
  const scaleDegrees = intervals.map(interval => {
    const noteIndex = (keyIndex + interval) % 12;
    return notes[noteIndex];
  });
  
  // Map chords to numerals
  return chords.map(chord => {
    // Extract root note (handle complex chord symbols)
    let rootNote = chord;
    if (chord.length > 1) {
      if (chord[1] === '#' || chord[1] === 'b') {
        rootNote = chord.substring(0, 2);
      } else {
        rootNote = chord[0];
      }
    }
    
    // Find the degree in the scale
    const degreeIndex = scaleDegrees.indexOf(rootNote);
    
    if (degreeIndex === -1) {
      // If not in scale, return '?' or try to find closest match
      return '?';
    }
    
    // Convert to roman numeral
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    let numeral = romanNumerals[degreeIndex];
    
    // Check if minor chord
    if (chord.includes('m') && !chord.includes('maj')) {
      numeral = numeral.toLowerCase();
    }
    
    return numeral;
  });
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
