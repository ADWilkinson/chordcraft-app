# ChordCraft Development Scripts

This directory contains helper scripts for developing and managing the ChordCraft application.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory with the following variables:

   ```bash
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   OPENAI_API_KEY=your_openai_api_key
   ```

3. For scripts that use Firebase Admin SDK, place your service account key file in the project root as `service-account.json`.

## Available Scripts

### Generate Progression

Generate a new chord progression using the OpenAI API.

```bash
# Basic usage
node generate-progression.js

# With specific parameters
node generate-progression.js --key C --scale major --mood happy --style pop

# With a specific starting chord
node generate-progression.js --startingChord C
```

Options:

- `--key, -k`: Music key (e.g., C, D, E)
- `--scale, -s`: Scale (e.g., major, minor)
- `--mood, -m`: Mood (e.g., happy, sad, energetic)
- `--style, -st`: Music style (e.g., pop, rock, jazz)
- `--startingChord, -c`: Starting chord (e.g., C, Am)

### Manage Reports

Manage reported progressions.

```bash
# List all reported progressions
node manage-reports.js --list

# Regenerate a specific progression
node manage-reports.js --regenerate <progression_id>

# Dismiss a report
node manage-reports.js --dismiss <progression_id>

# Regenerate all reported progressions
node manage-reports.js --regenerate-all
```

Options:

- `--list, -l`: List all reported progressions
- `--regenerate, -r`: Regenerate a specific progression
- `--dismiss, -d`: Dismiss a report
- `--regenerate-all, -ra`: Regenerate all reported progressions

### Seed Database

Seed the database with chord progressions.

```bash
# Generate 10 random progressions
node seed-database.js --count 10

# Generate progressions with specific parameters
node seed-database.js --count 5 --key C --scale minor

# Clear all progressions
node seed-database.js --clear

# Clear all reports
node seed-database.js --clear-reports
```

Options:

- `--count, -c`: Number of progressions to generate (default: 10)
- `--key, -k`: Music key (e.g., C, D, E)
- `--scale, -s`: Scale (e.g., major, minor)
- `--mood, -m`: Mood (e.g., happy, sad, energetic)
- `--style, -st`: Music style (e.g., pop, rock, jazz)
- `--clear`: Clear all progressions from the database
- `--clear-reports`: Clear all reports from the database

### Analyze Progressions

Analyze chord progressions in the database.

```bash
# Analyze all progressions
node analyze-progressions.js --all

# Show most popular progressions
node analyze-progressions.js --popular

# Show highest quality progressions
node analyze-progressions.js --quality

# Show database statistics
node analyze-progressions.js --stats

# Limit the number of results
node analyze-progressions.js --popular --limit 20
```

Options:

- `--all, -a`: Analyze all progressions
- `--popular, -p`: Show most popular progressions
- `--quality, -q`: Show highest quality progressions
- `--stats, -s`: Show database statistics
- `--limit, -l`: Limit the number of results (default: 10)

### Production Preparation

- **Check Security Rules**: Verifies Firebase security rules

  ```bash
  npm run check-security
  ```

- **Verify Cloud Functions**: Checks that all required Firebase Cloud Functions are set up

  ```bash
  npm run verify-functions
  ```

- **Optimize Performance**: Analyzes and optimizes app performance

  ```bash
  npm run optimize
  ```

- **Prepare Database for Production**: Checks for low-quality progressions and marks them for regeneration

  ```bash
  npm run prepare-db

  # Run in check-only mode (won't mark progressions for regeneration)
  npm run prepare-db -- --check-only

  # Set a custom quality threshold (default: 60)
  npm run prepare-db -- --threshold 70
  ```

- **Prepare Production Release**: Runs all necessary steps to prepare for production

  ```bash
  npm run release
  ```

- **Complete Production Release Process**: Runs all scripts in the correct order

  ```bash
  npm run prod-release
  ```

## NPM Scripts

You can also use the following npm scripts:

```bash
# Seed the database
npm run seed

# Generate a progression
npm run generate

# Manage reports
npm run reports

# Analyze progressions
npm run analyze

# Check security rules
npm run check-security

# Verify cloud functions
npm run verify-functions

# Optimize performance
npm run optimize

# Prepare database for production
npm run prepare-db

# Prepare production release
npm run release

# Run complete production release process
npm run prod-release
```

## Examples

### Generate a happy pop progression in C major

```bash
node generate-progression.js --key C --scale major --mood happy --style pop
```

### Regenerate all reported progressions

```bash
node manage-reports.js --regenerate-all
```

### Seed the database with 20 jazz progressions

```bash
node seed-database.js --count 20 --style jazz
```

### Show the 5 most popular progressions

```bash
node analyze-progressions.js --popular --limit 5
```

### Check security rules

```bash
npm run check-security
```

### Verify cloud functions

```bash
npm run verify-functions
```

### Optimize performance

```bash
npm run optimize
```

### Prepare database for production

```bash
npm run prepare-db

# Check only, don't mark for regeneration
npm run prepare-db -- --check-only
```

### Prepare production release

```bash
npm run release
```

### Run complete production release process

```bash
npm run prod-release
```

## Environment Variables

The scripts require the following environment variables:

- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Firebase service account JSON file
