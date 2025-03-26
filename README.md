# ChordCraft

ChordCraft is an AI-powered chord progression explorer with an elegant piano-inspired UI. It helps musicians, songwriters, and producers discover inspiring chord progressions for their music.

## Features

- Browse and discover chord progressions based on key, scale, mood, and style
- AI-powered generation of unique, musically coherent chord progressions
- Interactive playback with tempo control and visual chord highlighting
- Detailed musical analysis of chord progressions with theory explanations
- Save your favorite progressions for future reference
- Report inappropriate content with a simple modal interface
- Mobile-optimized interface with swipe gestures and responsive design
- Keyboard shortcuts for enhanced navigation and playback control
- Error boundary protection to prevent cascading failures
- Client-side caching to reduce API calls and improve performance
- Optimized Firebase queries with pagination for efficient data loading
- Offline support with local storage fallback

## Tech Stack

- React 19 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Firebase (Firestore, Functions, Hosting, Analytics)
- Web Audio API for chord playback
- OpenAI integration for chord progression generation and analysis

## Code Architecture

### Core Components

- **ProgressionDetail**: Displays chord progression details, player, analysis, and actions
- **ProgressionPlayer**: Interactive player with tempo control and visual chord highlighting
- **ProgressionAnalyzer**: Provides musical analysis and theory explanations
- **GeneratorForm**: Interface for discovering new progressions with the "Inspire Me" button
- **ProgressionCard**: Compact view of chord progressions for list displays
- **Layout**: Main application layout with responsive design
- **ReportProgressionModal**: Modal for reporting inappropriate content
- **ErrorBoundary**: Prevents cascading failures with graceful error handling

### Custom Hooks

- **useProgressionNavigation**: Manages progression state and navigation
- **useFavorites**: Handles favorite progression management
- **useProgression**: Fetches and manages progression data
- **useProgressions**: Handles paginated loading of progression data
- **useSwipe**: Detects swipe gestures for mobile navigation
- **useChordPlayer**: Manages audio playback of chord progressions

### Services

- **progressionService**: Handles fetching and filtering progressions
- **favoriteService**: Manages user favorites in Firestore
- **reportService**: Handles reporting inappropriate progressions
- **cacheService**: Provides client-side caching to reduce API calls

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase account (for backend features)
- OpenAI API key (for AI-powered generation)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/chordcraft-app.git
   cd chordcraft-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase and OpenAI configuration:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```

4. Set up Firebase:
   
   ```bash
   firebase init
   ```
   
   Select Firestore, Functions, and Hosting services.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Firebase Setup

### Firestore Collections

ChordCraft uses the following Firestore collections:

- **progressions**: Stores chord progressions
- **favorites**: Tracks user favorites
- **reports**: Manages reported progressions

### Cloud Functions

The `functions` directory contains Firebase cloud functions for:

- OpenAI integration for chord progression generation
- Handling progression reports
- Background tasks like database seeding and cleanup

## Performance Optimizations

ChordCraft implements several optimizations for better performance:

- **Client-side caching**: Reduces API calls by caching frequently accessed data
- **Pagination**: Efficiently loads progressions in smaller batches
- **Optimized queries**: Minimizes Firestore reads with efficient querying
- **Code splitting**: Loads only the necessary code for each page
- **Offline support**: Provides functionality even when offline

## Development

### Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the production build locally

### Directory Structure

- `/src/components`: Reusable UI components
- `/src/hooks`: Custom React hooks
- `/src/pages`: Page components
- `/src/services`: API and service functions
- `/src/firebase`: Firebase configuration
- `/src/types`: TypeScript type definitions
- `/src/constants`: Application constants
- `/src/utils`: Utility functions
- `/functions`: Firebase Cloud Functions

## Deployment

### Building for Production

```bash
npm run build
```

### Deploying to Firebase

```bash
firebase deploy
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with React, Vite, and Tailwind CSS
- Powered by Firebase and OpenAI
- Designed for musicians and creators