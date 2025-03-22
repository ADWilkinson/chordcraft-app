# ChordCraft Scripts

This directory contains utility scripts for the ChordCraft application.

## Setup

1. Copy `firebase-config.example.json` to `firebase-config.json` and update with your Firebase credentials
2. Copy `service-account.example.json` to `service-account.json` and update with your Firebase service account credentials
3. Run `npm install` to install dependencies

## Available Scripts

### Core Data Management Scripts

- **analyze-and-clean-progressions.js**: Analyzes existing progressions and removes low-quality ones
- **analyze-progressions.js**: Analyzes chord progressions and provides quality metrics
- **generate-progression.js**: Generates a new chord progression using the OpenAI API
- **manage-reports.js**: Manages reported progressions (list, regenerate, dismiss)
- **seed-openai-progressions.js**: Seeds the database with OpenAI-generated chord progressions

### Development & Deployment Scripts

- **check-security-rules.js**: Checks Firebase security rules for potential issues
- **delete-mock-data.js**: Deletes all progressions from the database (use with caution)
- **optimize.js**: Optimizes app performance for production
- **prepare-for-production.js**: Prepares the app for production deployment
- **prepare-production-release.js**: Prepares a production release
- **verify-cloud-functions.js**: Verifies that cloud functions are working correctly
- **check-dependencies.js**: Checks for outdated or vulnerable dependencies

## Usage Examples

### Analyze and Clean Progressions

```bash
node analyze-and-clean-progressions.js
```

This script will analyze all progressions in the database and prompt you to remove any that don't meet quality standards.

### Generate a Progression

```bash
node generate-progression.js --key C --scale major --mood happy --style pop
```

This will generate a new progression with the specified parameters and log it to the console.

### Manage Reported Progressions

```bash
# List all reported progressions
node manage-reports.js --list

# Regenerate a specific progression
node manage-reports.js --regenerate <progression-id>

# Dismiss a report
node manage-reports.js --dismiss <progression-id>

# Regenerate all reported progressions
node manage-reports.js --regenerate-all
```

### Seed Database with OpenAI Progressions

```bash
node seed-openai-progressions.js --count 10
```

This will generate 10 new chord progressions using OpenAI and add them to the database.

### Analyze Progressions

```bash
# Analyze all progressions
node analyze-progressions.js --all

# Show most popular progressions
node analyze-progressions.js --popular

# Show highest quality progressions
node analyze-progressions.js --quality

# Show database statistics
node analyze-progressions.js --stats
```

### Prepare for Production

```bash
node prepare-for-production.js
```

This script runs a series of checks and optimizations to prepare the app for production deployment.

## Script Configuration

Most scripts use configuration from the following files:

- `firebase-config.json`: Firebase project configuration
- `service-account.json`: Firebase Admin SDK credentials

Make sure these files are properly set up before running any scripts.

## Adding New Scripts

When adding new scripts:

1. Create your script file in the scripts directory
2. Add appropriate documentation in this README
3. If the script should be executable, run `./make-executable.sh your-script.js`
4. Add an npm script in the root package.json if needed