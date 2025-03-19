# ChordCraft

ChordCraft is an AI-powered chord progression explorer with an elegant piano-inspired UI. It helps musicians, songwriters, and producers discover inspiring chord progressions for their music.

## Features

- Browse chord progressions based on key, scale, mood, and style
- View one progression at a time with easy navigation
- Piano-inspired black and white design
- Mobile-optimized interface with a clean, minimal design
- Like your favorite progressions
- Collapsible search form for a focused experience

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Firebase (Firestore, Functions, Hosting, Analytics)
- React Router for navigation
- Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase account (for production deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ADWilkinson/chordcraft-app.git
   cd chordcraft-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/services` - API and service functions
- `/src/firebase` - Firebase configuration
- `/src/types` - TypeScript type definitions
- `/src/constants` - Application constants
- `/src/mock` - Mock data for development
- `/functions` - Firebase Cloud Functions for chord progression generation

## Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:

   ```bash
   firebase deploy --only hosting
   ```

3. Deploy Firebase Functions:

   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

## Live Demo

Visit the live application at: [https://chordcraft-app.web.app](https://chordcraft-app.web.app)

## License

This project is licensed under the MIT License.

## Acknowledgements

- Built with React, Vite, and Tailwind CSS
- Powered by Firebase
- Designed for musicians and creators
