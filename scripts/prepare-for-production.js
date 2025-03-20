#!/usr/bin/env node

/**
 * ChordCraft - Production Preparation Script
 * 
 * This script prepares the ChordCraft app for production by:
 * 1. Checking for low-quality progressions and marking them for regeneration
 * 2. Verifying database integrity
 * 3. Ensuring all necessary collections exist
 * 
 * Usage:
 *   node prepare-for-production.js
 */

require('dotenv').config();
const admin = require('firebase-admin');
const chalk = require('chalk');
const Table = require('cli-table3');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('check-only', {
    alias: 'c',
    description: 'Only check progressions, do not mark for regeneration',
    type: 'boolean',
    default: false
  })
  .option('threshold', {
    alias: 't',
    description: 'Quality threshold for marking progressions (0-100)',
    type: 'number',
    default: 60
  })
  .help()
  .alias('help', 'h')
  .argv;

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('./service-account.json');
} catch (error) {
  console.error(chalk.red('Error loading service-account.json:'), error.message);
  console.log(chalk.yellow('Make sure you have a valid service-account.json file in the scripts directory.'));
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Main function
async function prepareForProduction() {
  console.log(chalk.blue('=== ChordCraft Production Preparation ==='));
  
  // Check database integrity
  await checkDatabaseIntegrity();
  
  // Check for low-quality progressions
  await checkProgressionQuality();
  
  console.log(chalk.green('\n✅ Production preparation complete!'));
}

// Check database integrity
async function checkDatabaseIntegrity() {
  console.log(chalk.blue('\n=== Checking Database Integrity ==='));
  
  // Check if collections exist
  const collections = ['progressions', 'reports', 'users', 'analytics'];
  const missingCollections = [];
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).limit(1).get();
    if (snapshot.empty) {
      missingCollections.push(collection);
    }
  }
  
  if (missingCollections.length > 0) {
    console.log(chalk.yellow(`⚠️ Missing collections: ${missingCollections.join(', ')}`));
    
    for (const collection of missingCollections) {
      console.log(chalk.yellow(`Creating empty collection: ${collection}`));
      await db.collection(collection).doc('placeholder').set({
        created: admin.firestore.FieldValue.serverTimestamp(),
        placeholder: true
      });
      console.log(chalk.green(`✅ Created collection: ${collection}`));
    }
  } else {
    console.log(chalk.green('✅ All required collections exist'));
  }
  
  // Check for progressions without required fields
  console.log(chalk.blue('\n=== Checking Progression Data Integrity ==='));
  
  const progressionsSnapshot = await db.collection('progressions').get();
  
  if (progressionsSnapshot.empty) {
    console.log(chalk.yellow('⚠️ No progressions found in the database'));
    return;
  }
  
  console.log(chalk.green(`Found ${progressionsSnapshot.size} progressions`));
  
  const requiredFields = ['key', 'scale', 'chords', 'insights'];
  const incompleteProgressions = [];
  
  progressionsSnapshot.forEach(doc => {
    const data = doc.data();
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      incompleteProgressions.push({
        id: doc.id,
        missingFields
      });
    }
  });
  
  if (incompleteProgressions.length > 0) {
    console.log(chalk.yellow(`⚠️ Found ${incompleteProgressions.length} progressions with missing fields`));
    
    const table = new Table({
      head: ['ID', 'Missing Fields'],
      colWidths: [40, 40]
    });
    
    incompleteProgressions.forEach(prog => {
      table.push([
        prog.id,
        prog.missingFields.join(', ')
      ]);
    });
    
    console.log(table.toString());
    
    if (!argv.checkOnly) {
      console.log(chalk.yellow('Marking incomplete progressions for regeneration...'));
      
      for (const prog of incompleteProgressions) {
        await db.collection('reports').doc(prog.id).set({
          progressionId: prog.id,
          reason: 'Missing required fields: ' + prog.missingFields.join(', '),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          automatic: true
        });
      }
      
      console.log(chalk.green(`✅ Marked ${incompleteProgressions.length} progressions for regeneration`));
    } else {
      console.log(chalk.yellow('Check-only mode: Not marking progressions for regeneration'));
    }
  } else {
    console.log(chalk.green('✅ All progressions have required fields'));
  }
}

// Check progression quality
async function checkProgressionQuality() {
  console.log(chalk.blue('\n=== Checking Progression Quality ==='));
  
  const progressionsSnapshot = await db.collection('progressions').get();
  
  if (progressionsSnapshot.empty) {
    console.log(chalk.yellow('⚠️ No progressions found in the database'));
    return;
  }
  
  const lowQualityProgressions = [];
  
  progressionsSnapshot.forEach(doc => {
    const data = doc.data();
    let qualityScore = 100;
    
    // Check number of chords (at least 4 is good)
    if (data.chords && Array.isArray(data.chords)) {
      if (data.chords.length < 3) {
        qualityScore -= 40;
      } else if (data.chords.length < 4) {
        qualityScore -= 20;
      }
    } else {
      qualityScore -= 50;
    }
    
    // Check number of insights (at least 3 is good)
    if (data.insights && Array.isArray(data.insights)) {
      if (data.insights.length < 2) {
        qualityScore -= 30;
      } else if (data.insights.length < 3) {
        qualityScore -= 15;
      }
    } else {
      qualityScore -= 40;
    }
    
    // Check if key and scale are present
    if (!data.key || !data.scale) {
      qualityScore -= 30;
    }
    
    // Check if mood and style are present
    if (!data.mood) {
      qualityScore -= 10;
    }
    
    if (!data.style) {
      qualityScore -= 10;
    }
    
    if (qualityScore < argv.threshold) {
      lowQualityProgressions.push({
        id: doc.id,
        qualityScore,
        chords: data.chords?.length || 0,
        insights: data.insights?.length || 0
      });
    }
  });
  
  if (lowQualityProgressions.length > 0) {
    console.log(chalk.yellow(`⚠️ Found ${lowQualityProgressions.length} progressions below quality threshold (${argv.threshold})`));
    
    const table = new Table({
      head: ['ID', 'Quality Score', 'Chords', 'Insights'],
      colWidths: [40, 15, 10, 10]
    });
    
    lowQualityProgressions.forEach(prog => {
      table.push([
        prog.id,
        prog.qualityScore,
        prog.chords,
        prog.insights
      ]);
    });
    
    console.log(table.toString());
    
    if (!argv.checkOnly) {
      console.log(chalk.yellow('Marking low-quality progressions for regeneration...'));
      
      for (const prog of lowQualityProgressions) {
        // Check if this progression is already reported
        const reportSnapshot = await db.collection('reports').doc(prog.id).get();
        
        if (!reportSnapshot.exists) {
          await db.collection('reports').doc(prog.id).set({
            progressionId: prog.id,
            reason: `Low quality score: ${prog.qualityScore}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            automatic: true
          });
        }
      }
      
      console.log(chalk.green(`✅ Marked ${lowQualityProgressions.length} progressions for regeneration`));
    } else {
      console.log(chalk.yellow('Check-only mode: Not marking progressions for regeneration'));
    }
  } else {
    console.log(chalk.green(`✅ All progressions meet quality threshold (${argv.threshold})`));
  }
  
  // Check for existing reports
  const reportsSnapshot = await db.collection('reports').where('status', '==', 'pending').get();
  
  if (!reportsSnapshot.empty) {
    console.log(chalk.yellow(`⚠️ Found ${reportsSnapshot.size} pending reports that need regeneration`));
    
    const table = new Table({
      head: ['Progression ID', 'Reason', 'Timestamp'],
      colWidths: [40, 40, 20]
    });
    
    reportsSnapshot.forEach(doc => {
      const data = doc.data();
      table.push([
        data.progressionId,
        data.reason,
        data.timestamp ? data.timestamp.toDate().toISOString() : 'N/A'
      ]);
    });
    
    console.log(table.toString());
  } else {
    console.log(chalk.green('✅ No pending reports found'));
  }
}

// Run the script
prepareForProduction().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
