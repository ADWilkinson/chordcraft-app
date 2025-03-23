export default {
  "name": "ChordCraft",
  "slug": "chordcraft",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "userInterfaceStyle": "light",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.chordcraft.app"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "package": "com.chordcraft.app"
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "plugins": [
    "expo-av"
  ],
  "extra": {
    "firebase": {
      "apiKey": process.env.FIREBASE_API_KEY,
      "authDomain": process.env.FIREBASE_AUTH_DOMAIN,
      "projectId": process.env.FIREBASE_PROJECT_ID,
      "storageBucket": process.env.FIREBASE_STORAGE_BUCKET,
      "messagingSenderId": process.env.FIREBASE_MESSAGING_SENDER_ID,
      "appId": process.env.FIREBASE_APP_ID,
      "measurementId": process.env.FIREBASE_MEASUREMENT_ID
    }
  }
};