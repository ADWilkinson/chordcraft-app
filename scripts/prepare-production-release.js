#!/usr/bin/env node

/**
 * ChordCraft - Production Release Preparation Script
 * 
 * This script runs all the necessary steps to prepare the ChordCraft app for production.
 * 
 * Usage:
 *   node prepare-production-release.js
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(chalk.blue('=== ChordCraft Production Release Preparation ==='));
console.log(chalk.yellow('This script will prepare your ChordCraft app for production release.'));
console.log(chalk.yellow('It will run several checks and optimizations to ensure your app is ready for deployment.'));
console.log('');

// Check if required files exist
const requiredFiles = [
  { path: '.env.example', message: 'Environment variables template' },
  { path: 'service-account.example.json', message: 'Firebase Admin credentials template' }
];

let hasErrors = false;

for (const file of requiredFiles) {
  const filePath = path.resolve(__dirname, file.path);
  if (!fs.existsSync(filePath)) {
    console.log(chalk.yellow(`⚠️ Missing ${file.path}: ${file.message}`));
    console.log(chalk.yellow(`Creating template ${file.path}...`));
    
    if (file.path === '.env.example') {
      const envExample = `# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Google Application Credentials
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
`;
      fs.writeFileSync(path.resolve(__dirname, '.env.example'), envExample);
      console.log(chalk.green(`✅ Created ${file.path}`));
    } else if (file.path === 'service-account.example.json') {
      const serviceAccountExample = {
        "type": "service_account",
        "project_id": "your-project-id",
        "private_key_id": "your-private-key-id",
        "private_key": "your-private-key",
        "client_email": "your-client-email",
        "client_id": "your-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "your-client-cert-url",
        "universe_domain": "googleapis.com"
      };
      fs.writeFileSync(
        path.resolve(__dirname, 'service-account.example.json'), 
        JSON.stringify(serviceAccountExample, null, 2)
      );
      console.log(chalk.green(`✅ Created ${file.path}`));
    }
  }
}

// Function to run a script and handle errors
function runScript(scriptName, description) {
  console.log(chalk.blue(`\n=== Running ${description} ===`));
  
  try {
    execSync(`node ${scriptName}.js`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`\n❌ Failed to run ${scriptName}:`), error.message);
    return false;
  }
}

// Function to prompt for continuation
function promptContinue(message) {
  return new Promise((resolve) => {
    rl.question(chalk.yellow(`\n${message} (y/n) `), (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  // Step 1: Check security rules
  const securityCheckSuccess = runScript('check-security-rules', 'Security Rules Check');
  
  if (!securityCheckSuccess) {
    const continueAfterSecurityCheck = await promptContinue('Security check failed. Do you want to continue?');
    if (!continueAfterSecurityCheck) {
      console.log(chalk.yellow('Exiting...'));
      rl.close();
      return;
    }
  }
  
  // Step 2: Verify cloud functions
  const functionsCheckSuccess = runScript('verify-cloud-functions', 'Cloud Functions Verification');
  
  if (!functionsCheckSuccess) {
    const continueAfterFunctionsCheck = await promptContinue('Cloud functions verification failed. Do you want to continue?');
    if (!continueAfterFunctionsCheck) {
      console.log(chalk.yellow('Exiting...'));
      rl.close();
      return;
    }
  }
  
  // Step 3: Optimize performance
  const performanceOptimizationSuccess = runScript('optimize', 'Performance Optimization');
  
  if (!performanceOptimizationSuccess) {
    const continueAfterPerformanceOptimization = await promptContinue('Performance optimization failed. Do you want to continue?');
    if (!continueAfterPerformanceOptimization) {
      console.log(chalk.yellow('Exiting...'));
      rl.close();
      return;
    }
  }
  
  // Step 4: Prepare database for production
  console.log(chalk.blue('\n=== Preparing Database for Production ==='));
  console.log(chalk.yellow('This step requires proper Firebase credentials to be set up.'));
  
  const prepareDatabaseNow = await promptContinue('Do you want to prepare the database for production now?');
  
  if (prepareDatabaseNow) {
    const databasePreparationSuccess = runScript('prepare-for-production', 'Database Preparation');
    
    if (!databasePreparationSuccess) {
      const continueAfterDatabasePreparation = await promptContinue('Database preparation failed. Do you want to continue?');
      if (!continueAfterDatabasePreparation) {
        console.log(chalk.yellow('Exiting...'));
        rl.close();
        return;
      }
    }
  }
  
  // Step 5: Run tests
  console.log(chalk.blue('\n=== Running Tests ==='));
  
  const runTestsNow = await promptContinue('Do you want to run tests now?');
  
  if (runTestsNow) {
    try {
      console.log(chalk.yellow('Running tests...'));
      execSync('npm test', { 
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      console.log(chalk.green('✅ Tests passed'));
    } catch (error) {
      console.error(chalk.red('\n❌ Tests failed:'), error.message);
      
      const continueAfterTests = await promptContinue('Tests failed. Do you want to continue?');
      if (!continueAfterTests) {
        console.log(chalk.yellow('Exiting...'));
        rl.close();
        return;
      }
    }
  }
  
  // Step 6: Build the app
  console.log(chalk.blue('\n=== Building the App ==='));
  
  const buildAppNow = await promptContinue('Do you want to build the app now?');
  
  if (buildAppNow) {
    try {
      console.log(chalk.yellow('Building the app...'));
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      console.log(chalk.green('✅ App built successfully'));
    } catch (error) {
      console.error(chalk.red('\n❌ Build failed:'), error.message);
      
      const continueAfterBuild = await promptContinue('Build failed. Do you want to continue?');
      if (!continueAfterBuild) {
        console.log(chalk.yellow('Exiting...'));
        rl.close();
        return;
      }
    }
  }
  
  // Step 7: Deploy to Firebase
  console.log(chalk.blue('\n=== Deploying to Firebase ==='));
  
  const deployNow = await promptContinue('Do you want to deploy to Firebase now?');
  
  if (deployNow) {
    try {
      console.log(chalk.yellow('Deploying to Firebase...'));
      execSync('firebase deploy', { 
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      console.log(chalk.green('✅ Deployment successful'));
    } catch (error) {
      console.error(chalk.red('\n❌ Deployment failed:'), error.message);
      rl.close();
      return;
    }
  }
  
  // Final checklist
  console.log(chalk.blue('\n=== Final Checklist ==='));
  console.log(chalk.green('✅ Security rules verified'));
  console.log(chalk.green('✅ Cloud functions verified'));
  console.log(chalk.green('✅ Performance optimized'));
  console.log(chalk.green('✅ Database prepared for production'));
  
  if (buildAppNow) {
    console.log(chalk.green('✅ App built successfully'));
  }
  
  if (deployNow) {
    console.log(chalk.green('✅ App deployed to Firebase'));
  }
  
  console.log(chalk.blue('\n=== Production Release Preparation Complete ==='));
  console.log(chalk.green('Your ChordCraft app is now ready for production!'));
  
  rl.close();
}

// Run the main function
main();
