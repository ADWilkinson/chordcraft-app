/**
 * ChordCraft App - Firebase Cloud Functions
 * 
 * These functions power the AI chord progression generation for ChordCraft.
 */

import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

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
  createdAt: FirebaseFirestore.Timestamp;
  likes: number;
  flags: number;
}

interface GenerationParams {
  key?: string;
  scale?: string;
  mood?: string;
  style?: string;
}

/**
 * Generate a chord progression based on the provided parameters
 */
export const generateChordProgression = onCall<GenerationParams>(async (request) => {
  try {
    // Log the request
    logger.info("Generating chord progression", request.data);
    
    // Extract parameters
    const { key, scale, mood, style } = request.data || {};
    
    // Generate a chord progression (simplified for now)
    const progression = await generateProgression(key, scale, mood, style);
    
    // Save to Firestore
    const docRef = await db.collection("progressions").add(progression);
    
    // Return the progression with its ID
    return {
      id: docRef.id,
      ...progression
    };
  } catch (error) {
    logger.error("Error generating chord progression", error);
    throw new Error("Failed to generate chord progression");
  }
});

/**
 * Scheduled function to generate new chord progressions daily
 */
export const generateDailyProgressions = onSchedule("every day 00:00", async () => {
  try {
    logger.info("Generating daily chord progressions");
    
    // Generate a variety of progressions with different parameters
    const keys = ["C", "G", "D", "A", "E", "F"];
    const scales = ["major", "minor", "dorian", "mixolydian"];
    const moods = ["happy", "sad", "energetic", "relaxed", "dramatic"];
    const styles = ["pop", "rock", "jazz", "folk", "electronic"];
    
    // Generate 10 random progressions
    for (let i = 0; i < 10; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const scale = scales[Math.floor(Math.random() * scales.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      
      const progression = await generateProgression(key, scale, mood, style);
      
      await db.collection("progressions").add(progression);
    }
    
    logger.info("Successfully generated daily progressions");
  } catch (error) {
    logger.error("Error generating daily progressions", error);
  }
});

/**
 * Helper function to generate a chord progression
 * This is a simplified version - in a real app, this would use music theory rules
 * or potentially an AI model to generate progressions
 */
async function generateProgression(
  key: string = "C",
  scale: string = "major",
  mood: string = "happy",
  style: string = "pop"
): Promise<ChordProgression> {
  // Define chord progressions for different scales and moods
  const progressionTemplates: Record<string, Record<string, string[][]>> = {
    major: {
      happy: [
        ["I", "IV", "V", "I"],
        ["I", "V", "vi", "IV"],
        ["I", "IV", "I", "V"]
      ],
      sad: [
        ["I", "vi", "IV", "V"],
        ["I", "iii", "IV", "iv"],
        ["I", "vi", "ii", "V"]
      ],
      energetic: [
        ["I", "IV", "V", "V"],
        ["I", "iii", "IV", "V"],
        ["I", "V", "IV", "I"]
      ],
      relaxed: [
        ["I", "IV", "I", "V"],
        ["I", "vi", "IV", "I"],
        ["I", "iii", "vi", "IV"]
      ],
      dramatic: [
        ["I", "V", "vi", "iii"],
        ["I", "vi", "IV", "V"],
        ["I", "V", "vi", "IV"]
      ]
    },
    minor: {
      happy: [
        ["i", "VI", "VII", "i"],
        ["i", "III", "VII", "VI"],
        ["i", "VI", "III", "VII"]
      ],
      sad: [
        ["i", "iv", "v", "i"],
        ["i", "VI", "III", "VII"],
        ["i", "iv", "VII", "i"]
      ],
      energetic: [
        ["i", "VII", "VI", "VII"],
        ["i", "v", "VI", "VII"],
        ["i", "iv", "VII", "v"]
      ],
      relaxed: [
        ["i", "III", "VII", "i"],
        ["i", "iv", "i", "v"],
        ["i", "VI", "III", "i"]
      ],
      dramatic: [
        ["i", "v", "VI", "III"],
        ["i", "iv", "VII", "III"],
        ["i", "VII", "VI", "v"]
      ]
    },
    dorian: {
      happy: [
        ["i", "IV", "VII", "i"],
        ["i", "IV", "i", "VII"],
        ["i", "ii", "IV", "VII"]
      ],
      sad: [
        ["i", "iii", "IV", "i"],
        ["i", "IV", "iii", "i"],
        ["i", "v", "IV", "i"]
      ],
      energetic: [
        ["i", "IV", "VII", "v"],
        ["i", "VII", "IV", "i"],
        ["i", "ii", "VII", "IV"]
      ],
      relaxed: [
        ["i", "IV", "i", "v"],
        ["i", "iii", "IV", "i"],
        ["i", "IV", "VII", "i"]
      ],
      dramatic: [
        ["i", "v", "IV", "VII"],
        ["i", "VII", "v", "IV"],
        ["i", "IV", "v", "i"]
      ]
    },
    mixolydian: {
      happy: [
        ["I", "VII", "IV", "I"],
        ["I", "IV", "VII", "I"],
        ["I", "v", "VII", "IV"]
      ],
      sad: [
        ["I", "v", "IV", "I"],
        ["I", "iii", "VII", "I"],
        ["I", "VII", "v", "I"]
      ],
      energetic: [
        ["I", "VII", "I", "VII"],
        ["I", "IV", "VII", "IV"],
        ["I", "v", "IV", "VII"]
      ],
      relaxed: [
        ["I", "IV", "I", "VII"],
        ["I", "v", "I", "IV"],
        ["I", "VII", "IV", "I"]
      ],
      dramatic: [
        ["I", "v", "VII", "IV"],
        ["I", "VII", "v", "I"],
        ["I", "IV", "v", "VII"]
      ]
    }
  };
  
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
    createdAt: FirebaseFirestore.Timestamp.now(),
    likes: 0,
    flags: 0
  };
}

/**
 * Convert a roman numeral to an actual chord based on key and scale
 */
function romanNumeralToChord(numeral: string, key: string, scale: string): string {
  // Define the notes in each key
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const keyIndex = notes.indexOf(key);
  
  // Define scale intervals for different scales
  const scaleIntervals: Record<string, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  
  // Get the intervals for the requested scale
  const intervals = scaleIntervals[scale] || scaleIntervals.major;
  
  // Map roman numerals to scale degrees
  const numeralMap: Record<string, number> = {
    "I": 0, "i": 0,
    "II": 1, "ii": 1,
    "III": 2, "iii": 2,
    "IV": 3, "iv": 3,
    "V": 4, "v": 4,
    "VI": 5, "vi": 5,
    "VII": 6, "vii": 6
  };
  
  // Get the scale degree
  const scaleDegree = numeralMap[numeral];
  
  // Get the root note of the chord
  const rootIndex = (keyIndex + intervals[scaleDegree]) % 12;
  const rootNote = notes[rootIndex];
  
  // Determine if the chord is major or minor based on the numeral case
  const chordType = numeral === numeral.toLowerCase() ? "m" : "";
  
  return rootNote + chordType;
}

/**
 * Generate insights about the chord progression
 */
function generateInsights(
  template: string[],
  key: string,
  scale: string,
  mood: string,
  style: string
): string[] {
  const insights: string[] = [];
  
  // Add insight about the key and scale
  insights.push(`This progression is in ${key} ${scale}, which is commonly used in ${style} music.`);
  
  // Add insight about the mood
  insights.push(`The ${mood} mood is created by the specific chord choices and their relationships.`);
  
  // Add insight about common patterns
  if (template.includes("I") && template.includes("IV") && template.includes("V")) {
    insights.push("This progression uses the classic I-IV-V pattern found in many popular songs.");
  }
  
  if (template.includes("vi") && template.includes("IV")) {
    insights.push("The vi-IV movement creates a sense of emotional depth and is popular in contemporary music.");
  }
  
  // Add style-specific insights
  switch (style) {
    case "pop":
      insights.push("This progression has a catchy, accessible quality typical of pop music.");
      break;
    case "rock":
      insights.push("The chord voicings can be played with power chords for a classic rock sound.");
      break;
    case "jazz":
      insights.push("Try adding 7ths and 9ths to these chords for a more jazzy flavor.");
      break;
    case "folk":
      insights.push("This progression works well with fingerpicking patterns common in folk music.");
      break;
    case "electronic":
      insights.push("Consider using arpeggiated synths to bring out the harmonic movement.");
      break;
  }
  
  return insights;
}
