/**
 * OpenAI Service for ChordCraft
 * 
 * This module handles interactions with the OpenAI API for generating chord progressions.
 */

import OpenAI from "openai";
import * as logger from "firebase-functions/logger";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the structure of a chord progression response
interface ChordProgressionResponse {
  chords: string[];
  insights: string[];
  numerals?: string[];
}

// Define the parameters for generating a chord progression
interface GenerationParams {
  key: string;
  scale: string;
  mood: string;
  style: string;
  startingChord?: string;
}

/**
 * Generate a chord progression using OpenAI's API
 */
export async function generateChordProgressionWithAI(
  params: GenerationParams
): Promise<ChordProgressionResponse> {
  try {
    // Initialize OpenAI client using environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Create a prompt for the AI
    const prompt = createChordProgressionPrompt(params);
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a music theory expert specializing in chord progressions. Respond only with valid JSON that meets all the requirements in the user's prompt." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    
    // Extract the response content
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Validate the response structure
      if (!validateChordProgressionResponse(parsedResponse)) {
        throw new Error("Response failed validation");
      }
      
      return {
        chords: parsedResponse.chords,
        insights: parsedResponse.insights,
        numerals: parsedResponse.numerals || []
      };
    } catch (parseError) {
      logger.error("Failed to parse or validate OpenAI response", parseError);
      throw new Error("Failed to parse or validate OpenAI response");
    }
  } catch (error) {
    logger.error("OpenAI API error", error);
    
    // Provide a fallback response
    return getFallbackChordProgression(params);
  }
}

/**
 * Create a prompt for generating a chord progression
 */
function createChordProgressionPrompt(params: GenerationParams): string {
  const { key, scale, mood, style, startingChord } = params;
  
  let prompt = `Generate a high-quality chord progression in ${key || "any key"} ${scale || "scale"} with a ${mood || "any mood"} mood in the style of ${style || "any style"} music.`;
  
  if (startingChord) {
    prompt += ` The progression should start with the ${startingChord} chord.`;
  }
  
  prompt += `\n\nRequirements:
1. The progression MUST have at least 4 chords, preferably 6-8 chords for more musical interest
2. Provide at least 3 detailed musical insights about the progression
3. Each insight should be at least 2 sentences long and explain the music theory behind the progression
4. Include Roman numeral analysis for each chord in the progression
5. If a starting chord was specified, ensure the progression begins with that chord

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

/**
 * Validate a chord progression response
 */
function validateChordProgressionResponse(response: any): boolean {
  // Check if the response has the required fields
  if (!response || !Array.isArray(response.chords) || !Array.isArray(response.insights)) {
    logger.warn("Response missing required fields", response);
    return false;
  }
  
  // Check if there are enough chords (at least 4)
  if (response.chords.length < 4) {
    logger.warn("Not enough chords in response", response.chords);
    return false;
  }
  
  // Check if there are enough insights (at least 3)
  if (response.insights.length < 3) {
    logger.warn("Not enough insights in response", response.insights);
    return false;
  }
  
  // Check if insights are detailed enough (at least 50 characters each)
  const shortInsights = response.insights.filter((insight: string) => insight.length < 50);
  if (shortInsights.length > 0) {
    logger.warn("Some insights are too short", shortInsights);
    return false;
  }
  
  return true;
}

/**
 * Get a fallback chord progression if the API call fails
 */
function getFallbackChordProgression(params: GenerationParams): ChordProgressionResponse {
  const { key, scale, mood, style } = params;
  
  // Define some template progressions for different scales and moods
  const templates: Record<string, Record<string, string[][]>> = {
    major: {
      happy: [
        ["I", "IV", "V", "I", "IV", "V", "vi", "V"],
        ["I", "V", "vi", "IV", "I", "V", "IV", "I"],
        ["I", "IV", "I", "V", "vi", "IV", "V", "I"]
      ],
      sad: [
        ["I", "vi", "IV", "V", "vi", "IV", "V", "vi"],
        ["I", "iii", "IV", "iv", "I", "vi", "V", "I"],
        ["I", "vi", "ii", "V", "I", "vi", "IV", "V"]
      ],
      energetic: [
        ["I", "IV", "V", "V", "I", "IV", "V", "I"],
        ["I", "iii", "IV", "V", "I", "vi", "IV", "V"],
        ["I", "V", "IV", "I", "V", "vi", "IV", "I"]
      ],
      relaxed: [
        ["I", "IV", "I", "V", "vi", "IV", "I", "V"],
        ["I", "vi", "IV", "I", "V", "vi", "IV", "I"],
        ["I", "iii", "vi", "IV", "I", "iii", "IV", "I"]
      ],
      dramatic: [
        ["I", "V", "vi", "iii", "IV", "I", "V", "vi"],
        ["I", "vi", "IV", "V", "iii", "vi", "V", "I"],
        ["I", "V", "vi", "IV", "I", "V", "iii", "vi"]
      ]
    },
    minor: {
      happy: [
        ["i", "VI", "VII", "i", "VI", "VII", "v", "i"],
        ["i", "III", "VII", "VI", "i", "III", "VII", "i"],
        ["i", "VI", "III", "VII", "i", "VI", "VII", "i"]
      ],
      sad: [
        ["i", "iv", "v", "i", "VI", "iv", "v", "i"],
        ["i", "VI", "III", "VII", "i", "iv", "v", "i"],
        ["i", "iv", "VII", "i", "VI", "III", "v", "i"]
      ],
      energetic: [
        ["i", "VII", "VI", "VII", "i", "v", "VI", "VII"],
        ["i", "v", "VI", "VII", "i", "VII", "VI", "i"],
        ["i", "iv", "VII", "v", "i", "iv", "v", "i"]
      ],
      relaxed: [
        ["i", "III", "VII", "i", "VI", "III", "VII", "i"],
        ["i", "iv", "i", "v", "i", "VI", "v", "i"],
        ["i", "VI", "III", "i", "iv", "i", "v", "i"]
      ],
      dramatic: [
        ["i", "v", "VI", "III", "i", "VII", "VI", "i"],
        ["i", "iv", "VII", "III", "i", "v", "VI", "i"],
        ["i", "VII", "VI", "v", "i", "iv", "v", "i"]
      ]
    }
  };
  
  // Get a template for the requested scale and mood, or fall back to defaults
  const scaleTemplates = templates[scale] || templates.major;
  const moodTemplates = scaleTemplates[mood] || scaleTemplates.happy;
  
  // Pick a random template
  const template = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];
  
  // Convert roman numerals to actual chords
  const chords = template.map(numeral => romanNumeralToChord(numeral, key, scale));
  
  // Generate more detailed insights
  const insights = [
    `This is a ${mood || "versatile"} progression in ${key || "the key"} ${scale || "scale"}, commonly used in ${style || "various styles of"} music. The progression creates a sense of ${mood === "happy" ? "joy and uplift" : mood === "sad" ? "melancholy and reflection" : mood === "energetic" ? "drive and momentum" : mood === "relaxed" ? "calm and peace" : "drama and tension"} through its chord choices and movement.`,
    
    `The progression follows a ${template.slice(0, 4).join("-")} pattern in the first half, ${template[0] === template[4] ? "repeating the tonic to reinforce the home key" : "moving to " + template.slice(4, 8).join("-") + " in the second half"}. This structure creates a balanced feeling between tension and resolution, allowing for a satisfying musical journey. The use of ${template.includes("vi") || template.includes("iii") ? "mediant chords adds emotional depth" : template.includes("IV") ? "subdominant harmony adds warmth" : "dominant harmony adds tension"} to the progression.`,
    
    `From a music theory perspective, this progression ${template[template.length - 1] === template[0] ? "resolves back to the tonic, creating a sense of completion" : "ends on a " + template[template.length - 1] + " chord, creating an open-ended feeling"}. The voice leading between chords is smooth, with common tones shared between adjacent chords where possible. Try experimenting with different voicings and inversions to bring out different aspects of this progression's character.`
  ];
  
  return { 
    chords, 
    insights,
    numerals: template
  };
}

/**
 * Convert a roman numeral to an actual chord
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
