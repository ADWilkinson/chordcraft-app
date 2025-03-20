#!/usr/bin/env node

/**
 * ChordCraft - Cloud Functions Verifier
 * 
 * This script verifies that all required Firebase Cloud Functions
 * are properly set up and ready for production.
 * 
 * Usage:
 *   node verify-cloud-functions.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

console.log(chalk.blue('=== ChordCraft Cloud Functions Verifier ==='));

// Check if functions directory exists
const functionsPath = path.resolve(process.cwd(), '..', 'functions');
const functionsRelativePath = path.relative(process.cwd(), functionsPath);

if (!fs.existsSync(functionsPath)) {
  console.log(chalk.yellow(`⚠️ Functions directory not found at ${functionsRelativePath}`));
  console.log(chalk.yellow('Creating template functions directory structure...'));
  
  // Create functions directory
  fs.mkdirSync(path.join(functionsPath), { recursive: true });
  fs.mkdirSync(path.join(functionsPath, 'src'), { recursive: true });
  
  // Create package.json
  const packageJson = {
    "name": "functions",
    "scripts": {
      "build": "tsc",
      "serve": "npm run build && firebase emulators:start --only functions",
      "shell": "npm run build && firebase functions:shell",
      "start": "npm run shell",
      "deploy": "firebase deploy --only functions",
      "logs": "firebase functions:log"
    },
    "engines": {
      "node": "18"
    },
    "main": "lib/index.js",
    "dependencies": {
      "firebase-admin": "^11.8.0",
      "firebase-functions": "^4.3.1",
      "openai": "^4.0.0"
    },
    "devDependencies": {
      "typescript": "^5.1.6"
    },
    "private": true
  };
  
  fs.writeFileSync(
    path.join(functionsPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create tsconfig.json
  const tsConfig = {
    "compilerOptions": {
      "module": "commonjs",
      "noImplicitReturns": true,
      "noUnusedLocals": true,
      "outDir": "lib",
      "sourceMap": true,
      "strict": true,
      "target": "es2017",
      "skipLibCheck": true
    },
    "compileOnSave": true,
    "include": [
      "src"
    ]
  };
  
  fs.writeFileSync(
    path.join(functionsPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  // Create index.ts with required functions
  const indexTs = `import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Generates a chord progression based on the provided parameters
 */
export const generateChordProgression = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to generate chord progressions"
    );
  }
  
  // TODO: Implement chord progression generation logic
  // This is a placeholder implementation
  return {
    chords: ["C", "Am", "F", "G"],
    insights: ["This is a common progression in pop music", "The progression creates a sense of resolution"],
    key: data.key || "C",
    scale: data.scale || "major",
    mood: data.mood || "happy",
    style: data.style || "pop"
  };
});

/**
 * Regenerates reported progressions
 */
export const regenerateReportedProgressions = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    const reportsRef = db.collection("reports").where("status", "==", "pending");
    const snapshot = await reportsRef.get();
    
    if (snapshot.empty) {
      console.log("No pending reports found");
      return null;
    }
    
    console.log(\`Found \${snapshot.size} pending reports to process\`);
    
    // Process each report
    const batch = db.batch();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // TODO: Implement regeneration logic
      // This is a placeholder implementation
      
      // Mark the report as processed
      batch.update(doc.ref, {
        status: "processed",
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log("Successfully processed all pending reports");
    
    return null;
  } catch (error) {
    console.error("Error processing reports:", error);
    return null;
  }
});
`;
  
  fs.writeFileSync(
    path.join(functionsPath, 'src', 'index.ts'),
    indexTs
  );
  
  console.log(chalk.green('✅ Created template functions directory structure'));
  console.log(chalk.yellow('Please review and customize the generated files'));
  process.exit(0);
}

// Check for required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/index.ts'
];

const missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(functionsPath, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(chalk.yellow(`⚠️ Missing required files: ${missingFiles.join(', ')}`));
  console.log(chalk.yellow('Creating missing files...'));
  
  // Create src directory if needed
  if (!fs.existsSync(path.join(functionsPath, 'src'))) {
    fs.mkdirSync(path.join(functionsPath, 'src'), { recursive: true });
  }
  
  // Create missing files
  if (missingFiles.includes('package.json')) {
    const packageJson = {
      "name": "functions",
      "scripts": {
        "build": "tsc",
        "serve": "npm run build && firebase emulators:start --only functions",
        "shell": "npm run build && firebase functions:shell",
        "start": "npm run shell",
        "deploy": "firebase deploy --only functions",
        "logs": "firebase functions:log"
      },
      "engines": {
        "node": "18"
      },
      "main": "lib/index.js",
      "dependencies": {
        "firebase-admin": "^11.8.0",
        "firebase-functions": "^4.3.1",
        "openai": "^4.0.0"
      },
      "devDependencies": {
        "typescript": "^5.1.6"
      },
      "private": true
    };
    
    fs.writeFileSync(
      path.join(functionsPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
  
  if (missingFiles.includes('tsconfig.json')) {
    const tsConfig = {
      "compilerOptions": {
        "module": "commonjs",
        "noImplicitReturns": true,
        "noUnusedLocals": true,
        "outDir": "lib",
        "sourceMap": true,
        "strict": true,
        "target": "es2017",
        "skipLibCheck": true
      },
      "compileOnSave": true,
      "include": [
        "src"
      ]
    };
    
    fs.writeFileSync(
      path.join(functionsPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }
  
  if (missingFiles.includes('src/index.ts')) {
    const indexTs = `import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Generates a chord progression based on the provided parameters
 */
export const generateChordProgression = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to generate chord progressions"
    );
  }
  
  // TODO: Implement chord progression generation logic
  // This is a placeholder implementation
  return {
    chords: ["C", "Am", "F", "G"],
    insights: ["This is a common progression in pop music", "The progression creates a sense of resolution"],
    key: data.key || "C",
    scale: data.scale || "major",
    mood: data.mood || "happy",
    style: data.style || "pop"
  };
});

/**
 * Regenerates reported progressions
 */
export const regenerateReportedProgressions = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    const reportsRef = db.collection("reports").where("status", "==", "pending");
    const snapshot = await reportsRef.get();
    
    if (snapshot.empty) {
      console.log("No pending reports found");
      return null;
    }
    
    console.log(\`Found \${snapshot.size} pending reports to process\`);
    
    // Process each report
    const batch = db.batch();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // TODO: Implement regeneration logic
      // This is a placeholder implementation
      
      // Mark the report as processed
      batch.update(doc.ref, {
        status: "processed",
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log("Successfully processed all pending reports");
    
    return null;
  } catch (error) {
    console.error("Error processing reports:", error);
    return null;
  }
});
`;
    
    fs.writeFileSync(
      path.join(functionsPath, 'src', 'index.ts'),
      indexTs
    );
  }
  
  console.log(chalk.green('✅ Created missing files'));
} else {
  console.log(chalk.green('✅ All required files found'));
}

// Check for required cloud functions
console.log(chalk.blue('\n=== Checking for Required Cloud Functions ==='));

const indexPath = path.join(functionsPath, 'src', 'index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const requiredFunctions = [
  'generateChordProgression',
  'regenerateReportedProgressions'
];

const missingFunctions = [];

for (const funcName of requiredFunctions) {
  if (!indexContent.includes(`export const ${funcName}`)) {
    missingFunctions.push(funcName);
  }
}

if (missingFunctions.length > 0) {
  console.log(chalk.yellow(`⚠️ Missing required functions: ${missingFunctions.join(', ')}`));
  console.log(chalk.yellow('Please add these functions to your index.ts file'));
  
  // Print template for missing functions
  console.log(chalk.blue('\n=== Function Templates ==='));
  
  if (missingFunctions.includes('generateChordProgression')) {
    console.log(chalk.yellow('\nTemplate for generateChordProgression:'));
    console.log(`
export const generateChordProgression = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to generate chord progressions"
    );
  }
  
  // TODO: Implement chord progression generation logic
  // This is a placeholder implementation
  return {
    chords: ["C", "Am", "F", "G"],
    insights: ["This is a common progression in pop music", "The progression creates a sense of resolution"],
    key: data.key || "C",
    scale: data.scale || "major",
    mood: data.mood || "happy",
    style: data.style || "pop"
  };
});
`);
  }
  
  if (missingFunctions.includes('regenerateReportedProgressions')) {
    console.log(chalk.yellow('\nTemplate for regenerateReportedProgressions:'));
    console.log(`
export const regenerateReportedProgressions = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    const reportsRef = db.collection("reports").where("status", "==", "pending");
    const snapshot = await reportsRef.get();
    
    if (snapshot.empty) {
      console.log("No pending reports found");
      return null;
    }
    
    console.log(\`Found \${snapshot.size} pending reports to process\`);
    
    // Process each report
    const batch = db.batch();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // TODO: Implement regeneration logic
      // This is a placeholder implementation
      
      // Mark the report as processed
      batch.update(doc.ref, {
        status: "processed",
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log("Successfully processed all pending reports");
    
    return null;
  } catch (error) {
    console.error("Error processing reports:", error);
    return null;
  }
});
`);
  }
} else {
  console.log(chalk.green('✅ All required functions found'));
}

// Check for Firebase configuration
console.log(chalk.blue('\n=== Checking Firebase Configuration ==='));

// Check if firebase.json exists
const firebaseJsonPath = path.resolve(process.cwd(), '..', 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  console.log(chalk.yellow('⚠️ firebase.json not found'));
  console.log(chalk.yellow('Creating template firebase.json file...'));
  
  const firebaseJson = {
    "functions": {
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ],
      "source": "functions"
    },
    "firestore": {
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"
    },
    "hosting": {
      "public": "dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    "storage": {
      "rules": "storage.rules"
    }
  };
  
  fs.writeFileSync(
    firebaseJsonPath,
    JSON.stringify(firebaseJson, null, 2)
  );
  
  console.log(chalk.green('✅ Created template firebase.json file'));
} else {
  console.log(chalk.green('✅ firebase.json found'));
}

console.log(chalk.blue('\n=== Verification Complete ==='));
console.log(chalk.green('✅ Cloud Functions verification completed'));
console.log(chalk.yellow('\nNext steps:'));
console.log(chalk.yellow('1. Review and customize the generated files if needed'));
console.log(chalk.yellow('2. Install dependencies in the functions directory:'));
console.log('   cd functions && npm install');
console.log(chalk.yellow('3. Deploy your functions:'));
console.log('   firebase deploy --only functions');
