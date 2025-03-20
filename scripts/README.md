# ChordCraft Scripts

This directory contains utility scripts for the ChordCraft application.

## Setup

1. Copy `firebase-config.example.json` to `firebase-config.json` and update with your Firebase credentials
2. Copy `service-account.example.json` to `service-account.json` and update with your Firebase service account credentials
3. Run `npm install` to install dependencies

## Available Scripts

### Core Scripts

- **analyze-and-clean-progressions.js**: Analyzes existing progressions and removes low-quality ones
- **analyze-progressions.js**: Analyzes chord progressions and provides quality metrics
- **generate-progression.js**: Generates a new chord progression using the Firebase function
- **manage-reports.js**: Manages reported progressions (list, regenerate, dismiss)
- **seed-openai-progressions.js**: Seeds the database with OpenAI-generated chord progressions

### Utility Scripts

- **check-security-rules.js**: Checks Firebase security rules for potential issues
- **delete-mock-data.js**: Deletes all progressions from the database
- **optimize.js**: Optimizes app performance for production
- **prepare-for-production.js**: Prepares the app for production deployment
- **prepare-production-release.js**: Prepares a production release
- **verify-cloud-functions.js**: Verifies that cloud functions are working correctly

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
node seed-openai-progressions.js
```

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
