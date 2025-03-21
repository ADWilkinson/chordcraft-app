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

## Code Architecture

### Reusable Components

ChordCraft uses a modular component architecture to maximize code reuse and maintainability:

- **ProgressionDetail**: A reusable component for displaying chord progression details, including player controls, navigation buttons, and insights.
- **ProgressionCard**: A card component for displaying chord progressions in list views.
- **LoadingState**: A standardized loading spinner component.
- **EmptyState**: A configurable component for displaying empty states with customizable icons, titles, descriptions, and action buttons.

### Custom Hooks

- **useProgressionNavigation**: Manages progression state, navigation, and adding new progressions.
- **useFavorites**: Handles favorite progression management with Firestore integration.

This architecture allows for consistent UI across different pages while reducing code duplication and making the codebase more maintainable.

## Recent UI Improvements

The latest version of ChordCraft includes several UI enhancements:

- **Minimalist Design**: Refined the UI with cleaner borders, improved spacing, and more consistent typography
- **Enhanced Readability**: Increased text size for chord insights and analysis for better readability
- **Improved Interactions**: Added cursor pointers to interactive elements for better usability
- **Consistent Styling**: Standardized button styles, card designs, and color usage throughout the application
- **Responsive Layout**: Optimized the layout for various screen sizes with improved padding and margins

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

## Deployment

### Firebase Deployment

ChordCraft is designed to be deployed to Firebase. Follow these steps to deploy the application:

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Initialize Firebase** (if not already done):

   ```bash
   firebase init
   ```

   - Select Hosting, Firestore, and Functions
   - Choose your Firebase project
   - Set the public directory to `dist`
   - Configure as a single-page app
   - Set up automatic builds and deploys with GitHub (optional)

3. **Deploy to Firebase**:

   ```bash
   firebase deploy
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

For production, make sure to set these environment variables in your hosting platform.

### CI/CD Setup

For continuous integration and deployment, you can use GitHub Actions. A sample workflow file is included in `.github/workflows/firebase-hosting-merge.yml`.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/services` - API and service functions
- `/src/firebase` - Firebase configuration
- `/src/types` - TypeScript type definitions
- `/src/constants` - Application constants
- `/src/mock` - Mock data for development
- `/functions` - Firebase Cloud Functions for chord progression generation

## Live Demo

Visit the live application at: [https://chordcraft-app.web.app](https://chordcraft-app.web.app)

## License

This project is licensed under the MIT License.

## Acknowledgements

- Built with React, Vite, and Tailwind CSS
- Powered by Firebase
- Designed for musicians and creators
