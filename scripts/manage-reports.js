#!/usr/bin/env node

/**
 * ChordCraft - Manage Reported Progressions Script
 * 
 * This script allows developers to view and manage reported progressions
 * for testing and development purposes.
 * 
 * Usage:
 *   node manage-reports.js --list                 # List all reported progressions
 *   node manage-reports.js --regenerate <id>      # Regenerate a specific progression
 *   node manage-reports.js --dismiss <id>         # Dismiss a report
 *   node manage-reports.js --regenerate-all       # Regenerate all reported progressions
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  writeBatch
} = require('firebase/firestore');
const { getFunctions, httpsCallable } = require('firebase/functions');
const dotenv = require('dotenv');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Table = require('cli-table3');

// Load environment variables
dotenv.config();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('list', {
    alias: 'l',
    description: 'List all reported progressions',
    type: 'boolean',
  })
  .option('regenerate', {
    alias: 'r',
    description: 'Regenerate a specific progression',
    type: 'string',
  })
  .option('dismiss', {
    alias: 'd',
    description: 'Dismiss a report',
    type: 'string',
  })
  .option('regenerate-all', {
    alias: 'ra',
    description: 'Regenerate all reported progressions',
    type: 'boolean',
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
const db = getFirestore(app);
const functions = getFunctions(app);

// Collection names
const PROGRESSIONS_COLLECTION = 'progressions';
const REPORTS_COLLECTION = 'reports';

// List all reported progressions
async function listReportedProgressions() {
  try {
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION),
      where('reported', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No reported progressions found.');
      return;
    }
    
    const table = new Table({
      head: ['ID', 'Key', 'Scale', 'Mood', 'Style', 'Report Reason', 'Reported At'],
      colWidths: [24, 8, 10, 12, 12, 30, 24]
    });
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      table.push([
        doc.id,
        data.key || 'N/A',
        data.scale || 'N/A',
        data.mood || 'N/A',
        data.style || 'N/A',
        data.reportReason || 'N/A',
        data.reportedAt ? new Date(data.reportedAt.toDate()).toLocaleString() : 'N/A'
      ]);
    });
    
    console.log(table.toString());
  } catch (error) {
    console.error('Error listing reported progressions:', error);
  }
}

// Regenerate a specific progression
async function regenerateProgression(progressionId) {
  try {
    // Get the progression document
    const progressionRef = doc(db, PROGRESSIONS_COLLECTION, progressionId);
    const progressionDoc = await getDoc(progressionRef);
    
    if (!progressionDoc.exists()) {
      console.error(`Progression ${progressionId} not found.`);
      return;
    }
    
    const progressionData = progressionDoc.data();
    
    // Extract generation parameters
    const params = {
      key: progressionData.key,
      scale: progressionData.scale,
      mood: progressionData.mood,
      style: progressionData.style,
      startingChord: progressionData.startingChord
    };
    
    console.log(`Regenerating progression ${progressionId} with parameters:`, params);
    
    // Call the cloud function
    const generateChordProgression = httpsCallable(functions, 'generateChordProgression');
    const result = await generateChordProgression(params);
    
    // Update the progression document
    await updateDoc(progressionRef, {
      chords: result.data.chords,
      insights: result.data.insights,
      numerals: result.data.numerals || [],
      reported: false,
      reportReason: null,
      reportedAt: null,
      regeneratedAt: serverTimestamp(),
      regenerationCount: (progressionData.regenerationCount || 0) + 1
    });
    
    // Update reports
    const reportsQuery = query(
      collection(db, REPORTS_COLLECTION),
      where('progressionId', '==', progressionId),
      where('status', '==', 'pending')
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    
    const batch = writeBatch(db);
    reportsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'regenerated',
        resolvedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`Successfully regenerated progression ${progressionId}`);
    
    // Display the new progression
    console.log('\nNew Progression:');
    console.log('---------------');
    console.log('Chords:', result.data.chords.join(' - '));
    console.log('\nInsights:');
    result.data.insights.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight}`);
    });
  } catch (error) {
    console.error('Error regenerating progression:', error);
  }
}

// Dismiss a report
async function dismissReport(progressionId) {
  try {
    const progressionRef = doc(db, PROGRESSIONS_COLLECTION, progressionId);
    
    // Update the progression document
    await updateDoc(progressionRef, {
      reported: false,
      reportReason: null,
      reportedAt: null
    });
    
    // Update reports
    const reportsQuery = query(
      collection(db, REPORTS_COLLECTION),
      where('progressionId', '==', progressionId),
      where('status', '==', 'pending')
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    
    const batch = writeBatch(db);
    reportsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'dismissed',
        resolvedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`Successfully dismissed report for progression ${progressionId}`);
  } catch (error) {
    console.error('Error dismissing report:', error);
  }
}

// Regenerate all reported progressions
async function regenerateAllProgressions() {
  try {
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION),
      where('reported', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No reported progressions found.');
      return;
    }
    
    console.log(`Found ${querySnapshot.size} reported progressions to regenerate.`);
    
    for (const doc of querySnapshot.docs) {
      await regenerateProgression(doc.id);
    }
    
    console.log('Finished regenerating all reported progressions.');
  } catch (error) {
    console.error('Error regenerating all progressions:', error);
  }
}

// Main function
async function main() {
  if (argv.list) {
    await listReportedProgressions();
  } else if (argv.regenerate) {
    await regenerateProgression(argv.regenerate);
  } else if (argv.dismiss) {
    await dismissReport(argv.dismiss);
  } else if (argv['regenerate-all']) {
    await regenerateAllProgressions();
  } else {
    console.log('Please specify an action. Use --help for more information.');
  }
  
  process.exit(0);
}

main();
