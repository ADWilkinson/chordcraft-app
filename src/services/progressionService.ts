import { collection, query, where, getDocs, updateDoc, doc, getDoc, orderBy, limit, increment as firestoreIncrement, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChordProgression, GenerationParams } from '../types';
import { mockProgressions } from '../mock/progressions';

const PROGRESSIONS_COLLECTION = 'progressions';

// For development, use mock data or real Firebase
// Set to false to use real Firebase
const USE_MOCK_DATA = false;

export const fetchProgressions = async (params: GenerationParams): Promise<ChordProgression[]> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock data based on params
    let filtered = [...mockProgressions];
    
    if (params.key) {
      filtered = filtered.filter(prog => prog.key === params.key);
    }
    
    if (params.scale) {
      filtered = filtered.filter(prog => prog.scale === params.scale);
    }
    
    if (params.mood) {
      filtered = filtered.filter(prog => prog.mood === params.mood);
    }
    
    if (params.style) {
      filtered = filtered.filter(prog => prog.style === params.style);
    }
    
    return filtered;
  } else {
    try {
      // Create a query against the progressions collection
      let q = query(collection(db, PROGRESSIONS_COLLECTION));
      
      // Add filters based on params
      if (params.key) {
        q = query(q, where('key', '==', params.key));
      }
      
      if (params.scale) {
        q = query(q, where('scale', '==', params.scale));
      }
      
      if (params.mood) {
        q = query(q, where('mood', '==', params.mood));
      }
      
      if (params.style) {
        q = query(q, where('style', '==', params.style));
      }
      
      // Limit to 10 progressions and order by createdAt
      q = query(q, orderBy('createdAt', 'desc'), limit(10));
      
      const querySnapshot = await getDocs(q);
      const progressions: ChordProgression[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert string chords to Chord objects if needed
        let chords = data.chords;
        if (Array.isArray(chords) && typeof chords[0] === 'string') {
          chords = chords.map(chord => ({
            name: chord,
            notation: chord
          }));
        }
        
        progressions.push({
          id: doc.id,
          ...data,
          chords
        } as ChordProgression);
      });
      
      return progressions;
    } catch (error) {
      console.error('Error fetching progressions:', error);
      return [];
    }
  }
};

export const likeProgression = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data and increment likes
    const progression = mockProgressions.find(p => p.id === id);
    if (progression) {
      progression.likes += 1;
    }
  } else {
    try {
      // Get a reference to the progression document
      const progressionRef = doc(db, PROGRESSIONS_COLLECTION, id);
      
      // Increment the likes field
      await updateDoc(progressionRef, {
        likes: firestoreIncrement(1)
      });
    } catch (error) {
      console.error('Error liking progression:', error);
      throw error;
    }
  }
};

export const flagProgression = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data and increment flags
    const progression = mockProgressions.find(p => p.id === id);
    if (progression) {
      progression.flags = (progression.flags || 0) + 1;
    }
  } else {
    try {
      // Get a reference to the progression document
      const progressionRef = doc(db, PROGRESSIONS_COLLECTION, id);
      
      // Increment the flags field
      await updateDoc(progressionRef, {
        flags: firestoreIncrement(1)
      });
    } catch (error) {
      console.error('Error flagging progression:', error);
      throw error;
    }
  }
};

// New function to create a progression in Firestore
export const createProgression = async (progression: Omit<ChordProgression, 'id' | 'createdAt'>): Promise<string> => {
  if (USE_MOCK_DATA) {
    // Create a new progression in mock data
    const newId = (mockProgressions.length + 1).toString();
    const newProgression = {
      ...progression,
      id: newId,
      createdAt: new Date(),
      likes: 0,
      flags: 0
    };
    mockProgressions.push(newProgression);
    return newId;
  } else {
    try {
      // Add a new document to the progressions collection
      const docRef = await addDoc(collection(db, PROGRESSIONS_COLLECTION), {
        ...progression,
        createdAt: serverTimestamp(),
        likes: 0,
        flags: 0
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating progression:', error);
      throw error;
    }
  }
};

// New function to get a single progression by ID
export const getProgressionById = async (id: string): Promise<ChordProgression | null> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data
    const progression = mockProgressions.find(p => p.id === id);
    return progression || null;
  } else {
    try {
      // Get the document from Firestore
      const docRef = doc(db, PROGRESSIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert string chords to Chord objects if needed
        let chords = data.chords;
        if (Array.isArray(chords) && typeof chords[0] === 'string') {
          chords = chords.map(chord => ({
            name: chord,
            notation: chord
          }));
        }
        
        return {
          id: docSnap.id,
          ...data,
          chords
        } as ChordProgression;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting progression:', error);
      return null;
    }
  }
};

// Note: The generateProgression function has been removed as we're only using 
// scheduled Cloud Functions to generate progressions, not client-side generation
