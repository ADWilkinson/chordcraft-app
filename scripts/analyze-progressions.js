#!/usr/bin/env node

/**
 * ChordCraft - Analyze Progressions Script
 * 
 * This script analyzes chord progressions in the database and provides insights
 * about their quality, popularity, and other metrics.
 * 
 * Usage:
 *   node analyze-progressions.js --all              # Analyze all progressions
 *   node analyze-progressions.js --popular          # Show most popular progressions
 *   node analyze-progressions.js --quality          # Show highest quality progressions
 *   node analyze-progressions.js --stats            # Show database statistics
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit,
  where
} = require('firebase/firestore');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Table = require('cli-table3');
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
  console.error('Error loading Firebase config:', error);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('all', {
    alias: 'a',
    description: 'Analyze all progressions',
    type: 'boolean',
  })
  .option('popular', {
    alias: 'p',
    description: 'Show most popular progressions',
    type: 'boolean',
  })
  .option('quality', {
    alias: 'q',
    description: 'Show highest quality progressions',
    type: 'boolean',
  })
  .option('stats', {
    alias: 's',
    description: 'Show database statistics',
    type: 'boolean',
  })
  .option('limit', {
    alias: 'l',
    description: 'Limit the number of results',
    type: 'number',
    default: 10
  })
  .help()
  .alias('help', 'h')
  .argv;

// Collection names
const PROGRESSIONS_COLLECTION = 'progressions';

// Calculate quality score for a progression
function calculateQualityScore(progression) {
  let score = 0;
  
  // Length of chord progression (more chords = higher score, up to 8)
  const chordCount = Array.isArray(progression.chords) ? progression.chords.length : 0;
  score += Math.min(chordCount, 8) * 5; // Max 40 points
  
  // Number of insights (more insights = higher score, up to 5)
  const insightCount = Array.isArray(progression.insights) ? progression.insights.length : 0;
  score += Math.min(insightCount, 5) * 6; // Max 30 points
  
  // Length of insights (longer insights = higher score)
  if (Array.isArray(progression.insights)) {
    const avgInsightLength = progression.insights.reduce((sum, insight) => sum + insight.length, 0) / 
                             (progression.insights.length || 1);
    score += Math.min(Math.floor(avgInsightLength / 20), 10) * 2; // Max 20 points
  }
  
  // Presence of Roman numerals (having numerals = higher score)
  if (Array.isArray(progression.numerals) && progression.numerals.length > 0) {
    score += 10; // 10 points for having numerals
  }
  
  return score;
}

// Analyze all progressions
async function analyzeAllProgressions() {
  try {
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION),
      limit(argv.limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No progressions found.');
      return;
    }
    
    const table = new Table({
      head: ['ID', 'Key', 'Scale', 'Chords', 'Insights', 'Likes', 'Quality Score'],
      colWidths: [24, 8, 10, 30, 10, 8, 15]
    });
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const qualityScore = data.qualityScore || calculateQualityScore(data);
      
      table.push([
        doc.id,
        data.key || 'N/A',
        data.scale || 'N/A',
        Array.isArray(data.chords) 
          ? data.chords.slice(0, 5).join(' - ') + (data.chords.length > 5 ? ' ...' : '')
          : 'N/A',
        Array.isArray(data.insights) ? data.insights.length : 0,
        data.likes || 0,
        qualityScore
      ]);
    });
    
    console.log(table.toString());
  } catch (error) {
    console.error('Error analyzing progressions:', error);
  }
}

// Show most popular progressions
async function showPopularProgressions() {
  try {
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION),
      orderBy('likes', 'desc'),
      limit(argv.limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No progressions found.');
      return;
    }
    
    const table = new Table({
      head: ['ID', 'Key', 'Scale', 'Chords', 'Likes', 'Flags'],
      colWidths: [24, 8, 10, 40, 8, 8]
    });
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      table.push([
        doc.id,
        data.key || 'N/A',
        data.scale || 'N/A',
        Array.isArray(data.chords) 
          ? data.chords.join(' - ')
          : 'N/A',
        data.likes || 0,
        data.flags || 0
      ]);
    });
    
    console.log(chalk.green('Most Popular Progressions:'));
    console.log(table.toString());
  } catch (error) {
    console.error('Error showing popular progressions:', error);
  }
}

// Show highest quality progressions
async function showHighQualityProgressions() {
  try {
    // First, get all progressions
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No progressions found.');
      return;
    }
    
    // Calculate quality scores and sort
    const progressions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const qualityScore = data.qualityScore || calculateQualityScore(data);
      
      progressions.push({
        id: doc.id,
        ...data,
        qualityScore
      });
    });
    
    // Sort by quality score
    progressions.sort((a, b) => b.qualityScore - a.qualityScore);
    
    // Take the top N
    const topProgressions = progressions.slice(0, argv.limit);
    
    const table = new Table({
      head: ['ID', 'Key', 'Scale', 'Chords', 'Insights', 'Quality Score'],
      colWidths: [24, 8, 10, 40, 10, 15]
    });
    
    topProgressions.forEach((progression) => {
      table.push([
        progression.id,
        progression.key || 'N/A',
        progression.scale || 'N/A',
        Array.isArray(progression.chords) 
          ? progression.chords.join(' - ')
          : 'N/A',
        Array.isArray(progression.insights) ? progression.insights.length : 0,
        progression.qualityScore
      ]);
    });
    
    console.log(chalk.blue('Highest Quality Progressions:'));
    console.log(table.toString());
  } catch (error) {
    console.error('Error showing high quality progressions:', error);
  }
}

// Show database statistics
async function showDatabaseStats() {
  try {
    // Get all progressions
    const progressionsSnapshot = await getDocs(collection(db, PROGRESSIONS_COLLECTION));
    
    if (progressionsSnapshot.empty) {
      console.log('No progressions found.');
      return;
    }
    
    // Get reported progressions
    const reportedSnapshot = await getDocs(
      query(
        collection(db, PROGRESSIONS_COLLECTION),
        where('reported', '==', true)
      )
    );
    
    // Calculate statistics
    const stats = {
      totalProgressions: progressionsSnapshot.size,
      reportedProgressions: reportedSnapshot.size,
      totalLikes: 0,
      totalFlags: 0,
      averageChordCount: 0,
      averageInsightCount: 0,
      keyDistribution: {},
      scaleDistribution: {},
      moodDistribution: {},
      styleDistribution: {}
    };
    
    let totalChords = 0;
    let totalInsights = 0;
    
    progressionsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Count likes and flags
      stats.totalLikes += data.likes || 0;
      stats.totalFlags += data.flags || 0;
      
      // Count chords and insights
      if (Array.isArray(data.chords)) {
        totalChords += data.chords.length;
      }
      
      if (Array.isArray(data.insights)) {
        totalInsights += data.insights.length;
      }
      
      // Count keys
      if (data.key) {
        stats.keyDistribution[data.key] = (stats.keyDistribution[data.key] || 0) + 1;
      }
      
      // Count scales
      if (data.scale) {
        stats.scaleDistribution[data.scale] = (stats.scaleDistribution[data.scale] || 0) + 1;
      }
      
      // Count moods
      if (data.mood) {
        stats.moodDistribution[data.mood] = (stats.moodDistribution[data.mood] || 0) + 1;
      }
      
      // Count styles
      if (data.style) {
        stats.styleDistribution[data.style] = (stats.styleDistribution[data.style] || 0) + 1;
      }
    });
    
    stats.averageChordCount = totalChords / stats.totalProgressions;
    stats.averageInsightCount = totalInsights / stats.totalProgressions;
    
    // Display statistics
    console.log(chalk.yellow('Database Statistics:'));
    console.log('-------------------');
    console.log(`Total Progressions: ${stats.totalProgressions}`);
    console.log(`Reported Progressions: ${stats.reportedProgressions} (${(stats.reportedProgressions / stats.totalProgressions * 100).toFixed(2)}%)`);
    console.log(`Total Likes: ${stats.totalLikes}`);
    console.log(`Total Flags: ${stats.totalFlags}`);
    console.log(`Average Chord Count: ${stats.averageChordCount.toFixed(2)}`);
    console.log(`Average Insight Count: ${stats.averageInsightCount.toFixed(2)}`);
    
    console.log('\nKey Distribution:');
    Object.entries(stats.keyDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, count]) => {
        console.log(`  ${key}: ${count} (${(count / stats.totalProgressions * 100).toFixed(2)}%)`);
      });
    
    console.log('\nScale Distribution:');
    Object.entries(stats.scaleDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([scale, count]) => {
        console.log(`  ${scale}: ${count} (${(count / stats.totalProgressions * 100).toFixed(2)}%)`);
      });
    
    console.log('\nMood Distribution:');
    Object.entries(stats.moodDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([mood, count]) => {
        console.log(`  ${mood}: ${count} (${(count / stats.totalProgressions * 100).toFixed(2)}%)`);
      });
    
    console.log('\nStyle Distribution:');
    Object.entries(stats.styleDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([style, count]) => {
        console.log(`  ${style}: ${count} (${(count / stats.totalProgressions * 100).toFixed(2)}%)`);
      });
  } catch (error) {
    console.error('Error showing database statistics:', error);
  }
}

// Main function
async function main() {
  if (argv.all) {
    await analyzeAllProgressions();
  } else if (argv.popular) {
    await showPopularProgressions();
  } else if (argv.quality) {
    await showHighQualityProgressions();
  } else if (argv.stats) {
    await showDatabaseStats();
  } else {
    console.log('Please specify an action. Use --help for more information.');
  }
  
  process.exit(0);
}

main();
