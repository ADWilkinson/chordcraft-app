# ChordCraft

ChordCraft is an AI-powered chord progression generator with an elegant UI optimized for mobile devices. It helps musicians, songwriters, and producers discover inspiring chord progressions for their music.

## Features

- Generate chord progressions based on key, scale, mood, and style
- View musical insights about each progression
- Like or flag progressions to improve the system
- Mobile-optimized interface with a clean, minimal design

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
   ```
   git clone https://github.com/ADWilkinson/chordcraft-app.git
   cd chordcraft-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file based on `.env.example` and add your Firebase configuration.

4. Start the development server:
   ```
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

## Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Deploy to Firebase:
   ```
   firebase deploy
   ```

## License

This project is licensed under the MIT License.

## Acknowledgements

- Built with React, Vite, and Tailwind CSS
- Powered by Firebase
- Designed for musicians and creators
