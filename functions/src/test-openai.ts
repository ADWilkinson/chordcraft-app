/**
 * Test script for OpenAI integration
 * 
 * This script tests the OpenAI integration by generating a chord progression
 * Run with: npx ts-node src/test-openai.ts
 */

import { generateChordProgressionWithAI } from './openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOpenAI() {
  try {
    console.log('Testing OpenAI integration...');
    
    // Test parameters
    const params = {
      key: 'C',
      scale: 'major',
      mood: 'happy',
      style: 'pop',
      startingChord: 'C'
    };
    
    console.log(`Generating chord progression with params: ${JSON.stringify(params)}`);
    
    try {
      // Generate chord progression
      const result = await generateChordProgressionWithAI(params);
      
      console.log('Successfully generated chord progression:');
      console.log('Chords:', result.chords);
      console.log('Insights:', result.insights);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      console.log('Using fallback mechanism...');
      
      // The fallback mechanism is built into the function and will be used automatically
      console.log('Trying again to demonstrate fallback...');
      
      // Force an error by temporarily setting the API key to an invalid value
      const originalApiKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = '';
      
      try {
        const fallbackResult = await generateChordProgressionWithAI(params);
        
        console.log('Fallback chord progression:');
        console.log('Chords:', fallbackResult.chords);
        console.log('Insights:', fallbackResult.insights);
      } finally {
        // Restore the original API key
        process.env.OPENAI_API_KEY = originalApiKey;
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testOpenAI();
