/**
 * ChordCraft - Firestore Database Seeder
 * 
 * This script seeds the Firestore database with chord progressions.
 * It uses the Firebase Admin SDK with service account credentials.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin with service account
const serviceAccountPath = path.resolve(__dirname, '../functions/service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Music theory constants
const keys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'];
const scales = ['major', 'minor', 'dorian', 'mixolydian'];
const moods = ['happy', 'sad', 'energetic', 'relaxed', 'dramatic'];
const styles = ['pop', 'rock', 'jazz', 'folk', 'electronic'];

// Chord progression templates
const progressionTemplates = {
  major: {
    happy: [
      ['I', 'IV', 'V', 'I'],
      ['I', 'V', 'vi', 'IV'],
      ['I', 'IV', 'I', 'V']
    ],
    sad: [
      ['I', 'vi', 'IV', 'V'],
      ['I', 'iii', 'IV', 'iv'],
      ['I', 'vi', 'ii', 'V']
    ],
    energetic: [
      ['I', 'IV', 'V', 'V'],
      ['I', 'iii', 'IV', 'V'],
      ['I', 'V', 'IV', 'I']
    ],
    relaxed: [
      ['I', 'IV', 'I', 'V'],
      ['I', 'vi', 'IV', 'I'],
      ['I', 'iii', 'vi', 'IV']
    ],
    dramatic: [
      ['I', 'V', 'vi', 'iii'],
      ['I', 'vi', 'IV', 'V'],
      ['I', 'V', 'vi', 'IV']
    ]
  },
  minor: {
    happy: [
      ['i', 'VI', 'VII', 'i'],
      ['i', 'III', 'VII', 'VI'],
      ['i', 'VI', 'III', 'VII']
    ],
    sad: [
      ['i', 'iv', 'v', 'i'],
      ['i', 'VI', 'III', 'VII'],
      ['i', 'iv', 'VII', 'i']
    ],
    energetic: [
      ['i', 'VII', 'VI', 'VII'],
      ['i', 'v', 'VI', 'VII'],
      ['i', 'iv', 'VII', 'v']
    ],
    relaxed: [
      ['i', 'III', 'VII', 'i'],
      ['i', 'iv', 'i', 'v'],
      ['i', 'VI', 'III', 'i']
    ],
    dramatic: [
      ['i', 'v', 'VI', 'III'],
      ['i', 'iv', 'VII', 'III'],
      ['i', 'VII', 'VI', 'v']
    ]
  },
  dorian: {
    happy: [
      ['i', 'IV', 'VII', 'i'],
      ['i', 'IV', 'i', 'VII'],
      ['i', 'ii', 'IV', 'VII']
    ],
    sad: [
      ['i', 'iii', 'IV', 'i'],
      ['i', 'IV', 'iii', 'i'],
      ['i', 'v', 'IV', 'i']
    ],
    energetic: [
      ['i', 'IV', 'VII', 'v'],
      ['i', 'VII', 'IV', 'i'],
      ['i', 'ii', 'VII', 'IV']
    ],
    relaxed: [
      ['i', 'IV', 'i', 'v'],
      ['i', 'iii', 'IV', 'i'],
      ['i', 'IV', 'VII', 'i']
    ],
    dramatic: [
      ['i', 'v', 'IV', 'VII'],
      ['i', 'VII', 'v', 'IV'],
      ['i', 'IV', 'v', 'i']
    ]
  },
  mixolydian: {
    happy: [
      ['I', 'VII', 'IV', 'I'],
      ['I', 'IV', 'VII', 'I'],
      ['I', 'v', 'VII', 'IV']
    ],
    sad: [
      ['I', 'v', 'IV', 'I'],
      ['I', 'iii', 'VII', 'I'],
      ['I', 'VII', 'v', 'I']
    ],
    energetic: [
      ['I', 'VII', 'I', 'VII'],
      ['I', 'IV', 'VII', 'IV'],
      ['I', 'v', 'IV', 'VII']
    ],
    relaxed: [
      ['I', 'IV', 'I', 'VII'],
      ['I', 'v', 'I', 'IV'],
      ['I', 'VII', 'IV', 'I']
    ],
    dramatic: [
      ['I', 'v', 'VII', 'IV'],
      ['I', 'VII', 'v', 'I'],
      ['I', 'IV', 'v', 'VII']
    ]
  }
};

/**
 * Convert a roman numeral to an actual chord based on key and scale
 */
function romanNumeralToChord(numeral, key, scale) {
  // Define the notes in each key
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Handle flat keys
  const flatToSharp = {
    'Bb': 'A#',
    'Eb': 'D#',
    'Ab': 'G#',
    'Db': 'C#',
    'Gb': 'F#'
  };
  
  const normalizedKey = flatToSharp[key] || key;
  const keyIndex = notes.indexOf(normalizedKey);
  
  // Define scale intervals for different scales
  const scaleIntervals = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  
  // Get the intervals for the requested scale
  const intervals = scaleIntervals[scale] || scaleIntervals.major;
  
  // Map roman numerals to scale degrees
  const numeralMap = {
    'I': 0, 'i': 0,
    'II': 1, 'ii': 1,
    'III': 2, 'iii': 2,
    'IV': 3, 'iv': 3,
    'V': 4, 'v': 4,
    'VI': 5, 'vi': 5,
    'VII': 6, 'vii': 6
  };
  
  // Get the scale degree
  const scaleDegree = numeralMap[numeral];
  
  // Get the root note of the chord
  const rootIndex = (keyIndex + intervals[scaleDegree]) % 12;
  const rootNote = notes[rootIndex];
  
  // Convert back to flat notation if the original key was flat
  let displayNote = rootNote;
  if (key.includes('b')) {
    const sharpToFlat = {
      'C#': 'Db',
      'D#': 'Eb',
      'F#': 'Gb',
      'G#': 'Ab',
      'A#': 'Bb'
    };
    displayNote = sharpToFlat[rootNote] || rootNote;
  }
  
  // Determine if the chord is major or minor based on the numeral case
  const chordType = numeral === numeral.toLowerCase() ? 'm' : '';
  
  return displayNote + chordType;
}

/**
 * Generate insights about the chord progression
 */
function generateInsights(template, key, scale, mood, style) {
  const insights = [];
  
  // Add insight about the key and scale
  insights.push(`This progression is in ${key} ${scale}, which is commonly used in ${style} music.`);
  
  // Add insight about the mood
  insights.push(`The ${mood} mood is created by the specific chord choices and their relationships.`);
  
  // Add insight about common patterns
  if (template.includes('I') && template.includes('IV') && template.includes('V')) {
    insights.push('This progression uses the classic I-IV-V pattern found in many popular songs.');
  }
  
  if (template.includes('vi') && template.includes('IV')) {
    insights.push('The vi-IV movement creates a sense of emotional depth and is popular in contemporary music.');
  }
  
  // Add style-specific insights
  switch (style) {
    case 'pop':
      insights.push('This progression has a catchy, accessible quality typical of pop music.');
      break;
    case 'rock':
      insights.push('The chord voicings can be played with power chords for a classic rock sound.');
      break;
    case 'jazz':
      insights.push('Try adding 7ths and 9ths to these chords for a more jazzy flavor.');
      break;
    case 'folk':
      insights.push('This progression works well with fingerpicking patterns common in folk music.');
      break;
    case 'electronic':
      insights.push('Consider using arpeggiated synths to bring out the harmonic movement.');
      break;
  }
  
  return insights;
}

/**
 * Generate a chord progression
 */
function generateProgression(key = 'C', scale = 'major', mood = 'happy', style = 'pop') {
  // Default to major/happy if the requested scale or mood isn't available
  const scaleTemplates = progressionTemplates[scale] || progressionTemplates.major;
  const moodTemplates = scaleTemplates[mood] || scaleTemplates.happy;
  
  // Pick a random progression template
  const template = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];
  
  // Convert roman numerals to actual chords based on key and scale
  const chords = template.map(numeral => romanNumeralToChord(numeral, key, scale));
  
  // Generate insights based on the progression
  const insights = generateInsights(template, key, scale, mood, style);
  
  return {
    key,
    scale,
    chords,
    mood,
    style,
    insights,
    createdAt: admin.firestore.Timestamp.now(),
    likes: 0,
    flags: 0
  };
}

/**
 * Seed the database with chord progressions
 */
async function seedDatabase(count = 30) {
  console.log(`Seeding database with ${count} chord progressions...`);
  
  const progressionsCollection = db.collection('progressions');
  let batch = db.batch();
  let batchCount = 0;
  const batchSize = 20; // Firestore batch size limit is 500, but we'll use 20 for safety
  
  for (let i = 0; i < count; i++) {
    // Generate random parameters
    const key = keys[Math.floor(Math.random() * keys.length)];
    const scale = scales[Math.floor(Math.random() * scales.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    // Generate a progression
    const progression = generateProgression(key, scale, mood, style);
    
    // Add to batch
    const docRef = progressionsCollection.doc();
    batch.set(docRef, progression);
    batchCount++;
    
    // If we've reached the batch size, commit and start a new batch
    if (batchCount >= batchSize) {
      await batch.commit();
      console.log(`Committed batch of ${batchCount} progressions`);
      batch = db.batch(); // Create a new batch
      batchCount = 0;
    }
  }
  
  // Commit any remaining progressions
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} progressions`);
  }
  
  console.log('Database seeding complete!');
}

// Run the seeder
seedDatabase(50)
  .then(() => {
    console.log('Successfully seeded the database!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
