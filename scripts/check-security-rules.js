#!/usr/bin/env node

/**
 * ChordCraft Security Rules Checker
 * 
 * This script checks for the presence of Firebase security rules files and creates them if they don't exist.
 * It also performs basic security checks on the rules.
 * 
 * Usage:
 *   node check-security-rules.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue('=== ChordCraft Security Rules Checker ==='));

// Check for Firestore rules
const firestoreRulesPath = path.resolve(process.cwd(), '..', 'firestore.rules');
const firestoreRulesTemplatePath = path.resolve(process.cwd(), '..', 'firestore.rules.template');

if (!fs.existsSync(firestoreRulesPath)) {
  console.log(chalk.red('❌ firestore.rules file not found'));
  console.log('Creating a firestore.rules file...');
  
  const firestoreRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to progressions
    match /progressions/{progressionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Secure user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Secure reports
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
  
  try {
    // If the file doesn't exist, create it
    if (!fs.existsSync(firestoreRulesPath)) {
      fs.writeFileSync(firestoreRulesPath, firestoreRulesTemplate);
      console.log(chalk.green('✅ Created firestore.rules file'));
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Could not create firestore.rules file: ${error.message}`));
    console.log('Creating a template file instead...');
    fs.writeFileSync(firestoreRulesTemplatePath, firestoreRulesTemplate);
    console.log(chalk.green('✅ Created firestore.rules.template file'));
    console.log('Please review and rename to firestore.rules if appropriate');
  }
} else {
  console.log(chalk.green('✅ firestore.rules file found'));
  
  // Basic security checks
  const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');
  
  if (firestoreRules.includes('allow read: if true')) {
    console.log(chalk.yellow('⚠️ Public read access found. This is fine for progressions but should be restricted for sensitive collections. (1 occurrences)'));
  }
  
  if (firestoreRules.includes('allow write: if true')) {
    console.log(chalk.red('❌ Public write access found. This is a security risk! (1 occurrences)'));
  }
}

// Check for Storage rules
const storageRulesPath = path.resolve(process.cwd(), '..', 'storage.rules');
const storageRulesTemplatePath = path.resolve(process.cwd(), '..', 'storage.rules.template');

if (!fs.existsSync(storageRulesPath)) {
  console.log(chalk.red('❌ storage.rules file not found'));
  console.log('Creating a storage.rules file...');
  
  const storageRulesTemplate = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read all files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow users to upload their own profile images
    match /users/{userId}/profile.jpg {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to upload to progression images
    match /progressions/{progressionId}/{fileName} {
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}`;
  
  try {
    // If the file doesn't exist, create it
    if (!fs.existsSync(storageRulesPath)) {
      fs.writeFileSync(storageRulesPath, storageRulesTemplate);
      console.log(chalk.green('✅ Created storage.rules file'));
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Could not create storage.rules file: ${error.message}`));
    console.log('Creating a template file instead...');
    fs.writeFileSync(storageRulesTemplatePath, storageRulesTemplate);
    console.log(chalk.green('✅ Created storage.rules.template file'));
    console.log('Please review and rename to storage.rules if appropriate');
  }
} else {
  console.log(chalk.green('✅ storage.rules file found'));
}

console.log(chalk.blue('\n=== Security Recommendations ===\n'));
console.log('1. Ensure all collections have appropriate security rules');
console.log('2. Use authentication checks for sensitive operations');
console.log('3. Validate incoming data to prevent malicious writes');
console.log('4. Limit access to only what users need');
console.log('5. Test your security rules thoroughly before deployment');
console.log('6. Consider using Firebase App Check for additional security');
console.log('\nTo test your security rules, use the Firebase Emulator:\n');
console.log('firebase emulators:start');
console.log('\nTo deploy your security rules:\n');
console.log('firebase deploy --only firestore:rules,storage:rules');
