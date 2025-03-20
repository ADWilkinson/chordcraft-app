/**
 * ChordCraft - Delete Mock Data
 * 
 * This script deletes all existing chord progressions from the Firestore database.
 * It uses the Firebase Admin SDK with service account credentials.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin with service account
const serviceAccountPath = path.resolve(__dirname, '../functions/service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Delete all chord progressions from the database
 */
async function deleteAllProgressions() {
  try {
    console.log('Deleting all existing chord progressions...');
    
    // Get all progressions
    const snapshot = await db.collection('progressions').get();
    
    if (snapshot.empty) {
      console.log('No progressions found to delete.');
      return;
    }
    
    // Delete in batches to avoid timeouts
    const batchSize = 500;
    let batch = db.batch();
    let count = 0;
    let totalDeleted = 0;
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      totalDeleted++;
      
      // Commit when batch size is reached
      if (count >= batchSize) {
        console.log(`Committing batch of ${count} deletions...`);
        batch.commit();
        batch = db.batch();
        count = 0;
      }
    });
    
    // Commit any remaining deletes
    if (count > 0) {
      console.log(`Committing final batch of ${count} deletions...`);
      await batch.commit();
    }
    
    console.log(`Successfully deleted ${totalDeleted} chord progressions.`);
  } catch (error) {
    console.error('Error deleting progressions:', error);
  }
}

// Run the deletion
deleteAllProgressions()
  .then(() => {
    console.log('Deletion complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Deletion failed:', error);
    process.exit(1);
  });
