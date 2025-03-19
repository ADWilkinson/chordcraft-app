# ChordCraft App - Project Summary

## Project Overview
ChordCraft is an AI-powered chord progression generator with an elegant UI optimized for mobile devices. It helps musicians, songwriters, and producers discover inspiring chord progressions for their music by generating progressions based on user-defined parameters.

## Repository
- GitHub: https://github.com/ADWilkinson/chordcraft-app

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Functions, Hosting, Analytics)
- **Routing**: React Router
- **Animations**: Framer Motion

## Project Structure
```
chordcraft-app/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other assets
│   ├── components/         # Reusable UI components
│   │   ├── ChordProgression.tsx  # Displays a chord progression with insights
│   │   ├── GeneratorForm.tsx     # Form for generating chord progressions
│   │   └── Layout.tsx            # Main layout component
│   ├── constants/          # Application constants
│   │   └── music.ts        # Music theory constants (keys, scales, moods, styles)
│   ├── firebase/           # Firebase configuration
│   │   └── config.ts       # Firebase initialization
│   ├── mock/               # Mock data for development
│   │   └── progressions.ts # Sample chord progressions
│   ├── pages/              # Page components
│   │   ├── AboutPage.tsx   # About page with information about the app
│   │   └── HomePage.tsx    # Main page with generator form and results
│   ├── services/           # API and service functions
│   │   └── progressionService.ts # Service for fetching/managing progressions
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Types for chord progressions and parameters
│   ├── App.tsx             # Main App component with routing
│   ├── index.css           # Global styles with Tailwind
│   └── main.tsx            # Entry point
├── .env.example            # Template for environment variables
├── postcss.config.js       # PostCSS configuration for Tailwind
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.app.json       # TypeScript configuration for app
├── tsconfig.node.json      # TypeScript configuration for Node
└── vite.config.ts          # Vite configuration
```

## Key Features
1. **Chord Progression Generator**
   - Users can specify key, scale, mood, and style
   - All parameters are optional for flexibility
   - Form provides dropdown options for common music theory elements

2. **Progression Display**
   - Shows chords in a grid layout
   - Displays chord function and notation
   - Provides musical insights about the progression
   - Allows users to like or flag progressions

3. **Mobile-First Design**
   - Responsive layout optimized for mobile devices
   - Clean, minimal interface with elegant styling
   - Smooth animations for a polished user experience

## Current Implementation Status
- Basic project structure set up
- UI components created for generator form and chord progression display
- Mock data system implemented for development
- Firebase configuration prepared but not connected to a real project
- Routing implemented for home and about pages

## Next Steps
1. **Firebase Integration**
   - Create a Firebase project
   - Set up Firestore with appropriate collections and security rules
   - Configure Firebase Authentication if needed
   - Implement Firebase Functions for AI-powered chord generation

2. **AI Chord Generation**
   - Develop an algorithm or integrate with an AI service to generate musically valid chord progressions
   - Implement a system to generate musical insights about progressions
   - Create a scheduled function to build a library of progressions

3. **User Features**
   - Add ability to save favorite progressions
   - Implement user accounts (optional)
   - Add sharing functionality for progressions

4. **Deployment**
   - Deploy to Firebase Hosting
   - Set up CI/CD pipeline for automated deployments
   - Configure analytics to track user engagement

## Development Environment
- Node.js v18+ recommended
- npm for package management
- Firebase CLI for deployment

## Running the Project
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` from `.env.example` and add Firebase config
4. Start development server: `npm run dev`
5. Access at http://localhost:5173 (or other port if 5173 is in use)

## Building for Production
1. Build the project: `npm run build`
2. Preview the build: `npm run preview`
3. Deploy to Firebase: `firebase deploy`

## Notes on Implementation
- The app currently uses mock data in `src/mock/progressions.ts`
- Firebase integration is prepared but requires a real Firebase project
- The UI is designed to be minimal and elegant with a focus on mobile experience
- Tailwind CSS is used for styling with a dark theme as default
