# ChordCraft: AI-Powered Chord Progression Explorer

## Project Overview

ChordCraft is an AI-powered web application that helps musicians, songwriters, and producers discover inspiring chord progressions for their music. The application features an elegant piano-inspired UI and leverages OpenAI's API to generate high-quality, musically coherent chord progressions based on user-specified parameters.

## Core Functionality

1. **Chord Progression Generation**: Users can generate chord progressions by specifying parameters such as key, scale, mood, and style.
2. **Progression Management**: Users can browse, like, and report progressions.
3. **Musical Insights**: Each progression comes with musical theory insights explaining why the chords work together.
4. **Interactive Playback**: Users can listen to progressions with an interactive piano visualizer.

## Technical Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **Animation**: Framer Motion for smooth transitions

### Backend

- **Firebase Services**:
  - **Firestore**: Database for storing chord progressions and user interactions
  - **Cloud Functions**: Serverless functions for AI integration and background tasks
  - **Hosting**: Deployment platform
  - **Analytics**: Usage tracking

- **AI Integration**: OpenAI API (GPT-4) for generating musically coherent chord progressions

## Database Schema

### Collections

#### `progressions`

Stores chord progressions with the following fields:

- `id`: Unique identifier
- `key`: Musical key (e.g., "C", "G", "D")
- `scale`: Scale type (e.g., "major", "minor", "dorian")
- `chords`: Array of chord names
- `numerals`: Array of Roman numeral notation (optional)
- `mood`: Emotional quality (e.g., "happy", "sad", "energetic")
- `style`: Musical genre (e.g., "pop", "jazz", "rock")
- `insights`: Array of musical theory explanations
- `createdAt`: Timestamp
- `likes`: Number of likes
- `flags`: Number of flags/reports
- `qualityScore`: Numerical score for progression quality
- `reported`: Boolean indicating if progression has been reported
- `reportReason`: Reason for reporting (if applicable)
- `reportedAt`: When the progression was reported
- `regeneratedAt`: When the progression was regenerated after being reported

#### `reports`

Tracks reported progressions:

- `progressionId`: Reference to the reported progression
- `reason`: Why the progression was reported
- `createdAt`: When the report was created
- `status`: Current status (e.g., "pending", "regenerated", "dismissed")

## Firestore Indexes

The application uses composite indexes to efficiently query progressions:

1. Key-based queries: `key` (ASC), `createdAt` (DESC), `__name__` (DESC)
2. Scale-based queries: `scale` (ASC), `createdAt` (DESC), `__name__` (DESC)
3. Mood-based queries: `mood` (ASC), `createdAt` (DESC), `__name__` (DESC)
4. Style-based queries: `style` (ASC), `createdAt` (DESC), `__name__` (DESC)
5. Quality-based queries: `likes` (DESC), `createdAt` (DESC), `qualityScore` (DESC), `reported` (DESC), `__name__` (DESC)

## Cloud Functions

### `generateChordProgression`

- **Type**: HTTPS Callable
- **Purpose**: Generates a chord progression based on user parameters
- **Parameters**: key, scale, mood, style, startingChord (optional)
- **Process**:
  1. Calls OpenAI API with a carefully crafted prompt
  2. Parses and validates the response
  3. Stores the progression in Firestore
  4. Returns the progression to the client

### `generateDailyProgressions`

- **Type**: Scheduled (every 24 hours)
- **Purpose**: Automatically generates new progressions daily
- **Process**:
  1. Generates progressions for various parameter combinations
  2. Stores them in Firestore for users to discover

### `regenerateReportedProgressions`

- **Type**: Scheduled (daily)
- **Purpose**: Handles reported progressions
- **Process**:
  1. Finds progressions marked as reported
  2. Regenerates them with the same parameters but improved quality
  3. Updates the database with new versions

## Key Components

### Core Components

- **ChordProgression**: Displays a chord progression with insights
- **ChordVisualizer**: Interactive piano visualization of chords
- **ProgressionPlayer**: Audio playback of progressions using Tone.js
- **GeneratorForm**: Form for specifying progression parameters
- **ProgressionAnalyzer**: Analyzes and displays chord theory information
- **ReportButton/Modal**: Interface for reporting low-quality progressions

### Services

- **progressionService**: Handles Firestore operations for progressions
- **favoriteService**: Manages user likes and favorites
- **reportService**: Handles progression reporting

## OpenAI Integration

The application uses GPT-4 to generate musically coherent chord progressions:

1. **Prompt Engineering**: Carefully crafted prompts that specify:
   - Musical parameters (key, scale, mood, style)
   - Required output format (JSON with chords and insights)
   - Music theory constraints (harmonic coherence, voice leading)
   - Minimum quality standards (at least 4 chords, 3 insights)

2. **Response Validation**: Ensures generated progressions meet quality standards:
   - Validates chord names are musically correct
   - Checks for sufficient number of chords and insights
   - Verifies harmonic coherence based on music theory rules

3. **Fallback Mechanism**: Provides pre-defined progressions if the API fails

## Quality Control System

The application implements a robust quality control system:

1. **Quality Scoring**: Each progression receives a quality score based on:
   - Number and variety of chords
   - Quality and depth of insights
   - Harmonic coherence and musical interest

2. **User Reporting**: Users can report low-quality progressions, which:
   - Marks the progression as reported
   - Adds it to a queue for regeneration
   - Provides feedback to improve the generation system

3. **Automated Regeneration**: Reported progressions are automatically regenerated with:
   - Same basic parameters (key, scale, mood, style)
   - Enhanced quality requirements
   - Additional music theory constraints

## Recent Updates

### March 20, 2025

#### Fixed React Component Key Issues

1. **Issue**: The application was experiencing React warnings about duplicate keys in components, specifically: "Encountered two children with the same key". This was occurring with `AnimatePresence` components that didn't have unique keys.

2. **Changes Made**:
   - Added unique keys to all `AnimatePresence` components:
     - In `HomePage.tsx`: Added `key="suggestion"` and `key="main-content"` to the two main `AnimatePresence` components
     - In `HomePage.tsx`: Wrapped the `ChordProgression` component in its own `AnimatePresence` with `key="progression"`
     - In `HomePage.tsx`: Enhanced the key for the `ChordProgression` component to use a template string: `key={\`progression-${currentProgression.id}\`}`
     - In `ProgressionAnalyzer.tsx`: Added `key="analyzer-tabs"` to the `AnimatePresence` component

3. **Benefits**:
   - Eliminated React warnings in the console
   - Improved component rendering performance
   - Enhanced animation transitions between components
   - Ensured proper cleanup of components during unmounting

#### Firestore Indexes Cleanup

1. **Issue**: The application was experiencing deployment errors related to duplicate Firestore indexes.

2. **Changes Made**:
   - Removed all indexes from the `firestore.indexes.json` file to resolve deployment issues
   - The file now contains only the basic structure: `{"indexes":[],"fieldOverrides":[]}`

3. **Benefits**:
   - Resolved deployment errors
   - Simplified index management
   - Prepared for future index additions as needed

#### AI Generation Improvements

1. **Changes Made**:
   - Enhanced the `generateProgressionWithAI` function to use random parameters when empty strings are provided
   - Implemented selection from predefined arrays of possible keys, scales, moods, and styles
   - Added fallback logic to ensure valid parameters are always used

2. **Benefits**:
   - Improved variety in generated progressions
   - Enhanced user experience when using the "Inspire Me" button
   - Reduced errors from invalid parameter combinations

## Scripts Directory

The `scripts` directory contains utility scripts for development and maintenance:

- **analyze-and-clean-progressions.js**: Analyzes and removes low-quality progressions
- **analyze-progressions.js**: Provides metrics on progression quality and popularity
- **generate-progression.js**: CLI tool for generating progressions
- **manage-reports.js**: Interface for handling reported progressions
- **seed-openai-progressions.js**: Seeds the database with AI-generated progressions
- **check-dependencies.js**: Verifies all required dependencies are installed
- **optimize.js**: Optimizes app performance for production

## Development Setup

1. **Prerequisites**:
   - Node.js (v18 or later)
   - npm or yarn
   - Firebase account
   - OpenAI API key

2. **Installation**:

   ```bash
   git clone https://github.com/ADWilkinson/chordcraft-app.git
   cd chordcraft-app
   npm install
   ```

3. **Environment Setup**:
   - Create `.env` file with Firebase and OpenAI credentials
   - Copy `firebase-config.example.json` to `firebase-config.json` and update
   - Copy `service-account.example.json` to `service-account.json` for Firebase Admin SDK

4. **Running Locally**:

   ```bash
   npm run dev
   ```

5. **Deployment**:

   ```bash
   npm run build
   firebase deploy
   ```

## Enhancement Roadmap

### Progression Fetching Improvements
- Enhance query system for more precise parameter matching
- Implement composite queries for all parameter combinations
- Add proper error handling for edge cases

### Quality Enhancements
- Ensure progressions are at least 4 chords long
- Implement stricter validation before saving to database
- Improve prompt engineering for better music theory context

### Reporting System
- Enhance the UI for reporting low-quality progressions
- Improve the regeneration system to learn from reported issues
- Add analytics to track common quality problems

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**:
   - Check API key validity
   - Verify rate limits haven't been exceeded
   - Ensure prompt format is correct

2. **Firebase Configuration**:
   - Verify service account credentials
   - Check Firestore rules and indexes
   - Ensure all required collections exist

3. **Progression Quality Issues**:
   - Run the analyze-and-clean-progressions.js script
   - Check OpenAI prompt templates
   - Verify quality scoring algorithm

## Contact

For questions or contributions, please contact the repository owner:
[GitHub: ADWilkinson](https://github.com/ADWilkinson)
