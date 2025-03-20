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
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Firebase
let firebaseConfig;
try {
  // Try to load from local config
  const configPath = path.resolve(__dirname, './firebase-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    // Fallback to hardcoded config
    firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBwMN0aWF_7-_tYmLtP_0XKwZC6TLCsZWU",
      authDomain: "chordcraft-app.firebaseapp.com",
      projectId: "chordcraft-app",
      storageBucket: "chordcraft-app.appspot.com",
      messagingSenderId: "145725455668",
      appId: "1:145725455668:web:e3b7d7c2d2c12a0c1d7d1d",
      measurementId: "G-XXXXXXXXXX"
    };
  }
} catch (error) {
  console.error(chalk.red('Error loading Firebase config:'), error);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('key', {
    alias: 'k',
    description: 'Key of the progression',
    type: 'string',
  })
  .option('scale', {
    alias: 's',
    description: 'Scale of the progression',
    type: 'string',
  })
  .option('mood', {
    alias: 'm',
    description: 'Mood of the progression',
    type: 'string',
  })
  .option('style', {
    alias: 't',
    description: 'Style of the progression',
    type: 'string',
  })
  .option('startingChord', {
    alias: 'c',
    description: 'Starting chord of the progression',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv;

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
console.log(chalk.cyan('Generating progression with parameters:'));
console.log(JSON.stringify(params, null, 2));

// Call the cloud function
const generateChordProgression = httpsCallable(functions, 'generateChordProgression');

generateChordProgression(params)
  .then((result) => {
    console.log(chalk.green('\nGenerated Progression:'));
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
    console.error(chalk.red('Error generating progression:'), error);
  });
