#!/usr/bin/env node

/**
 * ChordCraft - Check Dependencies Script
 * 
 * This script checks if all required dependencies are installed for the scripts.
 * 
 * Usage:
 *   node check-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('=== ChordCraft Dependency Checker ==='));

// Required dependencies for scripts
const requiredDependencies = [
  'firebase',
  'firebase-admin',
  'openai',
  'dotenv',
  'yargs',
  'chalk',
  'cli-table3'
];

// Check if package.json exists
const packageJsonPath = path.resolve(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log(chalk.red('❌ package.json not found in scripts directory!'));
  console.log(chalk.yellow('Please create a package.json file with the required dependencies.'));
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const installedDependencies = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

// Check for missing dependencies
const missingDependencies = [];
for (const dep of requiredDependencies) {
  if (!installedDependencies[dep]) {
    missingDependencies.push(dep);
  }
}

if (missingDependencies.length > 0) {
  console.log(chalk.red(`❌ Missing dependencies: ${missingDependencies.join(', ')}`));
  console.log(chalk.yellow(`Run the following command to install missing dependencies:`));
  console.log(chalk.cyan(`npm install ${missingDependencies.join(' ')} --save`));
} else {
  console.log(chalk.green('✅ All required dependencies are installed!'));
}

// Check for configuration files
console.log(chalk.blue('\n=== Checking Configuration Files ==='));

// Check for service-account.json
const serviceAccountPath = path.resolve(__dirname, './service-account.json');
if (fs.existsSync(serviceAccountPath)) {
  console.log(chalk.green('✅ service-account.json found'));
} else {
  console.log(chalk.yellow('⚠️ service-account.json not found'));
  console.log(chalk.yellow('Copy service-account.example.json to service-account.json and update with your credentials'));
}

// Check for firebase-config.json
const firebaseConfigPath = path.resolve(__dirname, './firebase-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  console.log(chalk.green('✅ firebase-config.json found'));
} else {
  console.log(chalk.yellow('⚠️ firebase-config.json not found'));
  console.log(chalk.yellow('Copy firebase-config.example.json to firebase-config.json and update with your credentials'));
}

// Check for .env file
const envPath = path.resolve(__dirname, './.env');
if (fs.existsSync(envPath)) {
  console.log(chalk.green('✅ .env file found'));
} else {
  console.log(chalk.yellow('⚠️ .env file not found'));
  console.log(chalk.yellow('Create a .env file with your environment variables'));
}

console.log(chalk.blue('\n=== Setup Complete ==='));
console.log(chalk.cyan('You can now run the scripts in this directory.'));
console.log(chalk.cyan('See README.md for more information.'));
