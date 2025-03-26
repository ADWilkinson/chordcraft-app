# ChordCraft Project Constraints

This document outlines the key constraints and limitations of the ChordCraft application, along with recommended workarounds.

## Audio Playback

### Constraints:
- Web Audio API has inconsistent behavior across browsers
- Mobile browsers have limitations with audio autoplay
- Tone.js library initialization requires user interaction

### Workarounds:
- Always initialize audio context on explicit user interaction
- Implement fallback audio playback mechanisms
- Display clear instructions for enabling audio on mobile
- Use the Tone.js transport for reliable timing

## Firebase Limitations

### Constraints:
- Firestore query limitations (can't combine certain filters)
- Cloud Functions have cold start delays
- Free tier limitations on daily function invocations

### Workarounds:
- Structure data to avoid complex queries
- Implement client-side filtering when necessary
- Use batched writes to minimize operations
- Implement caching strategies to reduce function calls

## AI Generation Constraints

### Constraints:
- OpenAI API has rate limits and costs
- Generation quality varies based on prompts
- API failures need graceful handling

### Workarounds:
- Implement robust fallback mechanisms with pre-defined progressions
- Cache successful generations to reduce API calls
- Use client-side validation before sending requests
- Implement retry logic with exponential backoff

## Mobile UI Constraints

### Constraints:
- Limited screen space for chord visualization
- Touch interactions differ from desktop
- Piano visualization is challenging on small screens

### Workarounds:
- Use responsive design with breakpoints for different devices
- Implement touch-specific interactions (swipe, tap)
- Adapt piano visualization for mobile (fewer octaves, larger keys)
- Provide alternative visualization options for small screens 