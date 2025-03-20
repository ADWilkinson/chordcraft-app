#!/usr/bin/env node

/**
 * ChordCraft - Generate Progression Script
 * 
 * This script allows developers to generate new chord progressions from the command line
 * for testing and development purposes.
 * 
 * Usage:
 *   node generate-progression.js --key C --scale major --mood happy --style pop
 */

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Load environment variables
dotenv.config();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
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
  .option('startingChord', {
    alias: 'c',
    description: 'Starting chord (e.g., C, Am)',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Create the parameters object
const params = {
  key: argv.key,
  scale: argv.scale,
  mood: argv.mood,
  style: argv.style,
  startingChord: argv.startingChord
};

// Filter out undefined values
Object.keys(params).forEach(key => {
  if (params[key] === undefined) {
    delete params[key];
  }
});

// Log the parameters
console.log('Generating progression with parameters:');
console.log(JSON.stringify(params, null, 2));

// Call the cloud function
const generateChordProgression = httpsCallable(functions, 'generateChordProgression');

generateChordProgression(params)
  .then((result) => {
    console.log('\nGenerated Progression:');
    console.log('---------------------');
    console.log('Chords:', result.data.chords.join(' - '));
    console.log('\nRoman Numerals:', result.data.numerals ? result.data.numerals.join(' - ') : 'Not available');
    console.log('\nInsights:');
    result.data.insights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight}`);
    });
    console.log('\nKey:', result.data.key);
    console.log('Scale:', result.data.scale);
    console.log('Mood:', result.data.mood);
    console.log('Style:', result.data.style);
  })
  .catch((error) => {
    console.error('Error generating progression:', error);
  });
