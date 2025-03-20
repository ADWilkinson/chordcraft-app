/**
 * ChordCraft App - Analyze and Clean Progressions
 * 
 * This script analyzes existing progressions in the database and removes any
 * that don't meet our quality standards.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
let serviceAccount;
const serviceAccountPath = path.join(__dirname, './service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.log('Service account file not found. Using application default credentials.');
  
  // Check for GOOGLE_APPLICATION_CREDENTIALS environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
  } else {
    // Try to use Firebase CLI credentials
    try {
      admin.initializeApp({
        projectId: 'chordcraft-app'
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      console.log('Please set up Firebase credentials by running:');
      console.log('firebase login');
      process.exit(1);
    }
  }
}

const db = admin.firestore();
const PROGRESSIONS_COLLECTION = 'progressions';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Quality standards
const QUALITY_STANDARDS = {
  MIN_CHORDS: 6,
  MIN_INSIGHTS: 3,
  MIN_INSIGHT_LENGTH: 100,
  MIN_QUALITY_SCORE: 70
};

/**
 * Calculate a quality score for a progression
 */
function calculateQualityScore(progression) {
  let score = 100; // Start with perfect score
  const issues = [];
  
  // Check chord count
  if (!progression.chords || progression.chords.length < QUALITY_STANDARDS.MIN_CHORDS) {
    issues.push(`Insufficient chord count (minimum ${QUALITY_STANDARDS.MIN_CHORDS} required)`);
  }
  
  // Check insights count
  if (!progression.insights || progression.insights.length < QUALITY_STANDARDS.MIN_INSIGHTS) {
    issues.push(`Insufficient insights (minimum ${QUALITY_STANDARDS.MIN_INSIGHTS} required)`);
  }
  
  // Check insight quality
  if (progression.insights) {
    const shortInsights = progression.insights.filter(insight => insight.length < QUALITY_STANDARDS.MIN_INSIGHT_LENGTH);
    if (shortInsights.length > 0) {
      issues.push(`Some insights are too short (minimum ${QUALITY_STANDARDS.MIN_INSIGHT_LENGTH} characters required)`);
    }
  }
  
  // Deduct points for each issue
  if (issues.length > 0) {
    score -= issues.length * 20; // Deduct 20 points per issue
  }
  
  // Bonus points for longer progressions (up to +10)
  if (progression.chords && progression.chords.length > 8) {
    score += Math.min((progression.chords.length - 8) * 2, 10);
  }
  
  // Bonus points for more insights (up to +10)
  if (progression.insights && progression.insights.length > 3) {
    score += Math.min((progression.insights.length - 3) * 3, 10);
  }
  
  // Bonus points for detailed insights (up to +10)
  if (progression.insights) {
    const avgLength = progression.insights.reduce((sum, insight) => sum + insight.length, 0) / progression.insights.length;
    if (avgLength > 150) {
      score += Math.min(((avgLength - 150) / 10), 10);
    }
  }
  
  // Cap score between 0 and 100
  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

/**
 * Ask a yes/no question
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Analyze progressions and remove low-quality ones
 */
async function analyzeAndCleanProgressions() {
  try {
    console.log('Starting progression analysis...');
    
    // Get all progressions
    const progressionsSnapshot = await db.collection(PROGRESSIONS_COLLECTION).get();
    
    if (progressionsSnapshot.empty) {
      console.log('No progressions found in the database.');
      return;
    }
    
    console.log(`Found ${progressionsSnapshot.size} progressions to analyze.`);
    
    // Ask for confirmation before proceeding
    const confirmAnalysis = await askQuestion(`Do you want to analyze all ${progressionsSnapshot.size} progressions?`);
    if (!confirmAnalysis) {
      console.log('Analysis cancelled.');
      return;
    }
    
    // Ask if user wants to automatically delete low-quality progressions
    const autoDelete = await askQuestion('Do you want to automatically delete progressions below quality threshold?');
    
    let lowQualityCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    
    // Create a batch for updates
    let batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500; // Firestore batch limit
    
    // Process each progression
    for (const doc of progressionsSnapshot.docs) {
      const progression = doc.data();
      const { score, issues } = calculateQualityScore(progression);
      
      console.log(`Progression ${doc.id}: Score ${score}`);
      
      if (issues.length > 0) {
        console.log(`  Issues: ${issues.join(', ')}`);
      }
      
      // If score is below threshold, mark for deletion
      if (score < QUALITY_STANDARDS.MIN_QUALITY_SCORE) {
        lowQualityCount++;
        
        let shouldDelete = autoDelete;
        
        // If not auto-deleting, ask for each progression
        if (!autoDelete) {
          console.log(`  Low quality progression (score: ${score}).`);
          console.log(`  Key: ${progression.key} ${progression.scale}`);
          console.log(`  Mood: ${progression.mood}, Style: ${progression.style}`);
          console.log(`  Chords: ${progression.chords ? progression.chords.join(', ') : 'None'}`);
          
          if (progression.insights && progression.insights.length > 0) {
            console.log(`  First insight: ${progression.insights[0].substring(0, 100)}...`);
          }
          
          shouldDelete = await askQuestion('  Delete this progression?');
        }
        
        if (shouldDelete) {
          // Add to deletion batch
          batch.delete(doc.ref);
          batchCount++;
          deletedCount++;
          console.log(`  Marked for deletion.`);
        } else {
          // Update the progression with quality score but don't delete
          batch.update(doc.ref, {
            qualityChecked: true,
            qualityCheckDate: admin.firestore.Timestamp.now(),
            qualityScore: score,
            qualityIssues: issues.length > 0 ? issues : null
          });
          batchCount++;
          updatedCount++;
          console.log(`  Marked for update only.`);
        }
      } else {
        // Update the progression with quality score
        batch.update(doc.ref, {
          qualityChecked: true,
          qualityCheckDate: admin.firestore.Timestamp.now(),
          qualityScore: score,
          qualityIssues: issues.length > 0 ? issues : null
        });
        batchCount++;
        updatedCount++;
      }
      
      // Commit batch if it reaches the limit
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} operations.`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit any remaining operations
    if (batchCount > 0) {
      // Ask for final confirmation before committing changes
      const confirmCommit = await askQuestion(`Ready to commit ${deletedCount} deletions and ${updatedCount} updates. Proceed?`);
      
      if (confirmCommit) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} operations.`);
      } else {
        console.log('Changes cancelled. No progressions were modified.');
        return;
      }
    }
    
    console.log('\nAnalysis complete!');
    console.log(`Total progressions: ${progressionsSnapshot.size}`);
    console.log(`Low quality progressions: ${lowQualityCount}`);
    console.log(`Progressions updated: ${updatedCount}`);
    console.log(`Progressions deleted: ${deletedCount}`);
    
  } catch (error) {
    console.error('Error analyzing progressions:', error);
  } finally {
    // Close readline interface
    rl.close();
  }
}

// Run the analysis
analyzeAndCleanProgressions();
