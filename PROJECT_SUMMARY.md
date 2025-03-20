# ChordCraft App - Project Summary

## Project Overview
ChordCraft is an AI-powered chord progression explorer with an elegant piano-inspired UI. It helps musicians, songwriters, and producers discover inspiring chord progressions for their music through a clean, focused interface.

## Repository
- GitHub: [https://github.com/ADWilkinson/chordcraft-app](https://github.com/ADWilkinson/chordcraft-app)
- Live Demo: [https://chordcraft-app.web.app](https://chordcraft-app.web.app)

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite
- **Styling**: Tailwind CSS 4.0
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
│   │   ├── GeneratorForm.tsx     # Form for fetching chord progressions
│   │   └── Layout.tsx            # Main layout component with piano-inspired design
│   ├── constants/          # Application constants
│   │   └── music.ts        # Music theory constants (keys, scales, moods, styles)
│   ├── firebase/           # Firebase configuration
│   │   └── config.ts       # Firebase initialization
│   ├── mock/               # Mock data for development
│   │   └── progressions.ts # Sample chord progressions
│   ├── pages/              # Page components
│   │   ├── AboutPage.tsx   # About page with information about the app
│   │   └── HomePage.tsx    # Main page with one progression at a time and navigation
│   ├── services/           # API and service functions
│   │   └── progressionService.ts # Service for fetching progressions
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Types for chord progressions and parameters
│   ├── App.tsx             # Main App component with routing
│   ├── index.css           # Global styles with piano-inspired theme
│   └── main.tsx            # Entry point
├── functions/              # Firebase Cloud Functions
│   ├── src/                # Function source code
│   │   └── index.ts        # Cloud Functions implementation
│   ├── package.json        # Functions dependencies
│   └── tsconfig.json       # TypeScript configuration for Functions
├── .env.example            # Template for environment variables
├── postcss.config.js       # PostCSS configuration for Tailwind
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.app.json       # TypeScript configuration for app
├── tsconfig.node.json      # TypeScript configuration for Node
└── vite.config.ts          # Vite configuration

## Key Features
1. **Chord Progression Explorer**
   - Users can browse progressions by key, scale, mood, and style
   - All parameters are optional for flexibility
   - Form provides dropdown options for common music theory elements
   - Form can be toggled to focus on viewing progressions
2. **Single Progression View**
   - Shows one chord progression at a time
   - Easy navigation between progressions
   - Displays chord function and notation
   - Provides musical insights about the progression
   - Allows users to like progressions
3. **Piano-Inspired Design**
   - Clean black and white color scheme
   - Elegant, minimal interface with text links instead of block buttons
   - Responsive layout for all devices
   - Smooth animations for a polished user experience

## Current Implementation Status
- Complete UI implementation with piano-inspired design
- Single progression view with navigation controls
- Toggleable search form with improved compact layout
- Minimalist UI with text links and icons instead of block buttons
- Properly formatted genre and mood tags with capitalization
- Improved visual hierarchy and consistent styling across components
- Tailwind CSS 4.0 integration with custom animations and transitions

## Recent UI Improvements (March 2025)
1. **GeneratorForm Enhancements**
   - Converted to a more compact, single-column layout
   - Improved input field styling with consistent borders
   - Added placeholder text to the Starting Chord input
   - Simplified form controls with better spacing
2. **ChordProgression Component**
   - Replaced block buttons with minimal text links and icons
   - Added proper capitalization to mood and style tags
   - Improved chord display with better visual hierarchy
   - Enhanced insights panel with numbered list items
3. **Navigation Controls**
   - Made navigation buttons smaller and more consistent
   - Added white background to Previous/Next buttons for better contrast
   - Improved "Modify Search" button placement and styling

## AI Integration Requirements (For Tomorrow)
1. **OpenAI Integration**
   - Set up OpenAI API connection with proper authentication
   - Create a service for generating chord progressions using GPT-4
   - Implement prompt engineering for musical theory context
2. **Chord Progression Generation**
   - Design prompts that incorporate music theory rules
   - Create a system for generating chord progressions based on user parameters
   - Implement validation to ensure generated progressions are musically valid
3. **Musical Insights Generation**
   - Create a system for analyzing chord progressions
   - Generate insightful comments about chord functions and relationships
   - Provide suggestions for melody writing and arrangement
4. **Error Handling and Fallbacks**
   - Implement proper error handling for API failures
   - Create fallback mechanisms using pre-generated progressions
   - Add loading states and user feedback during generation
5. **API Key Management**
   - Set up secure environment variables for API keys
   - Implement server-side proxy for API calls to protect keys
   - Add rate limiting to prevent excessive API usage

## Next Steps
1. **User Authentication**
   - Add user accounts for saving favorite progressions
   - Implement profile pages to view saved progressions
2. **Enhanced AI Generation**
   - Improve the chord progression generation algorithm
   - Add more musical insights and theory explanations
   - Create more diverse and interesting progressions
3. **Additional Features**
   - Add audio playback of chord progressions
   - Implement sharing functionality for progressions
   - Create a progression history feature

## Development Environment
- Node.js v18+ recommended
- npm for package management
- Firebase CLI for deployment
- OpenAI API key (for tomorrow's AI integration)

## Running the Project
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Firebase configuration
4. Start the development server with `npm run dev`
5. For Functions development, navigate to the `functions` directory and run `npm install`

## Notes
- The app uses a piano-inspired black and white color scheme
- The UI is focused on displaying one progression at a time for a cleaner experience
- Tomorrow's work will focus on integrating OpenAI for more intelligent chord progression generation
