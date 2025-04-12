/**
 * OpenAI Service for ChordCraft
 *
 * This module handles interactions with the OpenAI API for generating chord progressions.
 */

import OpenAI from "openai";
import * as logger from "firebase-functions/logger";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * @fileoverview This file contains the OpenAI service for generating chord progressions.
 */

// Constants for scales, moods, and other fixed values
const SCALES = {
  MAJOR: "major",
  MINOR: "minor",
};

const MOODS = {
  HAPPY: "happy",
  SAD: "sad",
  ENERGETIC: "energetic",
  RELAXED: "relaxed",
  DRAMATIC: "dramatic",
};

const DEFAULT_PARAMS = {
  SCALE: SCALES.MAJOR,
  MOOD: MOODS.HAPPY,
  STYLE: "any style",
  KEY: "C",
};

const ROMAN_NUMERALS = {
  "I": 0, "i": 0,
  "II": 1, "ii": 1,
  "III": 2, "iii": 2,
  "IV": 3, "iv": 3,
  "V": 4, "v": 4,
  "VI": 5, "vi": 5,
  "VII": 6, "vii": 6
};
interface GenerationParams {
  key: string;
  scale: string;
  mood: string;
  style: string;
  startingChord?: string;
}

/**
 * Represents the response from the OpenAI API for a chord progression.
 */
interface ChordProgressionResponse {
  chords: string[]; // Array of chord names (e.g., ["C", "Am", "F", "G"])
  insights: string[]; // Array of musical insights about the progression
  numerals?: string[]; // Optional array of Roman numeral analysis for each chord
}




/**
 * Generate a chord progression using OpenAI's API
 */
export async function generateChordProgressionWithAI(
  params: GenerationParams
): Promise<ChordProgressionResponse> {
  try {
    return await generateProgression(params);
  } catch (error: any) {
    logger.error("Error generating chord progression", error);
    return getFallbackChordProgression(params);
  }
}

/**
 * Internal function to handle the chord progression generation logic.
 *
 * @param {GenerationParams} params - The parameters for generating the chord progression.
 * @returns {Promise<ChordProgressionResponse>} - A promise that resolves to the generated chord progression.
 * @throws {Error} - Throws an error if the OpenAI API key is not defined or if there's an issue with the API call.
 */
const generateProgression = async (
  params: GenerationParams
): Promise<ChordProgressionResponse> => {
  const openai = createOpenAIClient();
  const prompt = createChordProgressionPrompt(params);
  const response = await callOpenAI(openai, prompt);
  return parseOpenAIResponse(response);
};

/**
 * Initializes the OpenAI client using the API key from environment variables.
 *
 * @returns {OpenAI} - An instance of the OpenAI client.
 * @throws {Error} - Throws an error if the OPENAI_API_KEY is not defined.
 */
const createOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables");
  }
  return new OpenAI({ apiKey });
};

/**
 * Calls the OpenAI API to generate a chord progression.
 *
 * @param {OpenAI} openai - The initialized OpenAI client.
 * @param {string} prompt - The prompt for the OpenAI API.
 * @returns {Promise<OpenAI.Chat.Completions.ChatCompletion>} - A promise that resolves to the API response.
 * @throws {Error} - Throws an error if there's an issue with the API call.
 */
const callOpenAI = async (
  openai: OpenAI,
  prompt: string
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  try {
    return await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a music theory expert specializing in chord progressions. Respond only with valid JSON that meets all the requirements in the user's prompt.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
  } catch (error: any) {
    logger.error("Error calling OpenAI API", error);
    throw new Error(`OpenAI API call failed: ${error.message}`);
  }
};

/**
 * Parses the response from the OpenAI API and validates it.
 *
 * @param {OpenAI.Chat.Completions.ChatCompletion} response - The response from the OpenAI API.
 * @returns {ChordProgressionResponse} - The parsed and validated chord progression response.
 * @throws {Error} - Throws an error if the response is empty, invalid, or cannot be parsed.
 */
const parseOpenAIResponse = (
  response: OpenAI.Chat.Completions.ChatCompletion
): ChordProgressionResponse => {
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  try {
    const parsedResponse = JSON.parse(content) as Partial<ChordProgressionResponse>;

    if (!validateChordProgressionResponse(parsedResponse)) {
      throw new Error("Response failed validation");
    }

    let chords = parsedResponse.chords || [];

    if (chords.length > 0 && typeof chords[0] === "object" && chords[0].name) {
      chords = chords.map((chord: any) => chord.name || chord.notation || "");
    }

    return {
      chords: chords,
      insights: parsedResponse.insights || [],
      numerals: parsedResponse.numerals || [],
    } as ChordProgressionResponse;
  } catch (parseError: any) {
    logger.error("Failed to parse or validate OpenAI response", parseError);
    throw new Error(
      `Failed to parse or validate OpenAI response: ${parseError.message}`
    );
  }
};

/**
 * Creates a prompt for generating a chord progression.
 */
const createChordProgressionPrompt = (params: GenerationParams): string => {
  const { key = DEFAULT_PARAMS.KEY, scale = DEFAULT_PARAMS.SCALE, mood = DEFAULT_PARAMS.MOOD, style = DEFAULT_PARAMS.STYLE, startingChord } = params;
  const adjustedScale = adjustScaleBasedOnStartingChord(scale, startingChord);
  let prompt = `Generate a high-quality chord progression in ${key} ${adjustedScale} with a ${mood} mood in the style of ${style} music.`;
  if (startingChord) {
    prompt += ` The progression should start with the ${startingChord} chord.`;
  }
  
  prompt += `\n\nRequirements:
1. The progression MUST have at least 4 chords, preferably 8-12 chords for more musical interest and development
2. Provide at least 3 detailed musical insights about the progression
3. Each insight should be at least 3 sentences long and explain the music theory behind the progression in detail
4. Include Roman numeral analysis for each chord in the progression
5. If a starting chord was specified, ensure the progression begins with that chord
6. Include a mix of chord types (e.g., major, minor, 7th, maj7, etc.) appropriate for the style and mood
7. Ensure the progression has a clear harmonic direction and resolution
8. Consider including at least one interesting or unexpected chord that adds color while still being musically coherent

Respond with a JSON object containing:
1. An array of chords (at least 6 chords, preferably 8-12) named "chords"
2. An array of detailed musical insights (at least 3 items) about the progression named "insights"
3. An array of Roman numeral analysis for each chord named "numerals"

Example response format:
{
  "chords": ["C", "Am", "F", "G", "Em", "F", "G", "C"],
  "numerals": ["I", "vi", "IV", "V", "iii", "IV", "V", "I"].
  "insights": [
    "This progression follows a I-vi-IV-V pattern in the first half, which is common in pop and rock music from the 1950s and 1960s. The second half introduces the iii chord (Em) for added emotional depth before resolving back to the tonic through a IV-V-I authentic cadence. This creates a satisfying circular motion that makes the progression feel complete.",
    "The movement from C to Am creates a smooth transition between relative major and minor, creating a bittersweet feeling that works well with ${mood} themes. This is enhanced by the later use of Em which reinforces the minor quality while maintaining the overall ${key} ${adjustedScale} tonality. The voice leading between these chords allows for minimal movement between notes, creating a cohesive sound.",
    "The F to G resolution creates tension that resolves back to C, forming a perfect authentic cadence (IV-V-I). This strong resolution gives the progression a sense of completion and satisfaction. In ${style} music, this cadential pattern is often emphasized with dynamic changes or rhythmic variation to highlight the emotional release at the return to the tonic chord."
  ]
}`;
  
  return prompt;
}

/**
 * Adjusts the scale based on the starting chord. If the starting chord is minor and the scale is major, it switches to minor.
 * @param scale The initial scale.
 * @param startingChord The optional starting chord.
 * @returns The adjusted scale.
 */
const adjustScaleBasedOnStartingChord = (scale: string, startingChord?: string): string => {
  let adjustedScale = scale;
  if (startingChord && startingChord.endsWith('m') && !startingChord.includes('maj') && scale.toLowerCase() === SCALES.MAJOR) {
    adjustedScale = SCALES.MINOR;
  }
  return adjustedScale;
};

/**
 * Validate a chord progression response
 * @param response The response to validate
 */
function validateChordProgressionResponse(response: any): boolean {
  // Check if the response has the required fields
  if (!response || !Array.isArray(response.chords) || !Array.isArray(response.insights)) {
    logger.warn("Response missing required fields", response);
    return false;
  }
  
  // Check if there are enough chords (at least 6)
  if (response.chords.length < 6) {
    logger.warn("Not enough chords in response", response.chords);
    return false;
  }
  
  // Check if all chords are valid (either strings or objects with name property)
  const invalidChords = response.chords.filter((chord: any) => 
    typeof chord !== 'string' && 
    (typeof chord !== 'object' || !chord.name)
  );
  
  if (invalidChords.length > 0) {
    logger.warn("Invalid chord format in response", invalidChords);
    return false;
  }
  
  // Check if there are enough insights (at least 3)
  if (response.insights.length < 3) {
    logger.warn("Not enough insights in response", response.insights);
    return false;
  }
  
  // Check if insights are detailed enough (at least 100 characters each)
  const shortInsights = response.insights.filter((insight: string) => insight.length < 100);
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
  const { key = DEFAULT_PARAMS.KEY, scale = DEFAULT_PARAMS.SCALE, mood = DEFAULT_PARAMS.MOOD, style = DEFAULT_PARAMS.STYLE } = params;
  
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
      `This is a ${mood} progression in ${key} ${scale}, commonly used in ${style} music. The progression creates a sense of ${mood === MOODS.HAPPY ? "joy and uplift" : mood === MOODS.SAD ? "melancholy and reflection" : mood === MOODS.ENERGETIC ? "drive and momentum" : mood === MOODS.RELAXED ? "calm and peace" : "drama and tension"} through its chord choices and movement.`,
    
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
  const scaleIntervals = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  
  // Get the intervals for the requested scale
  const intervals = scaleIntervals[scale] || scaleIntervals.major;
  
  // Map roman numerals to scale degrees
  const numeralMap = ROMAN_NUMERALS;
  // Get the scale degree
  const scaleDegree = numeralMap[numeral];
  
  // Get the root note of the chord
  const rootIndex = (keyIndex + intervals[scaleDegree]) % 12;
  const rootNote = notes[rootIndex];
  
  // Determine if the chord is major or minor based on the numeral case
  const chordType = numeral === numeral.toLowerCase() ? "m" : "";
  
  return rootNote + chordType;
}
