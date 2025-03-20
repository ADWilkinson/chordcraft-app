import { collection, query, where, getDocs, updateDoc, doc, getDoc, orderBy, limit, increment as firestoreIncrement, addDoc, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
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

    if (params.startingChord) {
      filtered = filtered.filter(prog => 
        prog.chords && 
        prog.chords.length > 0 && 
        (typeof prog.chords[0] === 'string' 
          ? prog.chords[0] === params.startingChord
          : prog.chords[0].name === params.startingChord)
      );
    }
    
    return filtered;
  } else {
    try {
      // Create a query against the progressions collection
      let q = query(collection(db, PROGRESSIONS_COLLECTION));
      
      // Add filters based on params - only add filters for non-empty parameters
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

      if (params.startingChord) {
        // We need to filter for starting chord in the application code
        // since we can't directly query for the first element of an array in Firestore
        q = query(q, where('startingChord', '==', params.startingChord));
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
      
      // Filter for starting chord in the application code if needed
      let filteredProgressions = progressions;
      if (params.startingChord) {
        filteredProgressions = progressions.filter(prog => 
          prog.chords && 
          prog.chords.length > 0 && 
          (typeof prog.chords[0] === 'string' 
            ? prog.chords[0] === params.startingChord
            : prog.chords[0].name === params.startingChord)
        );
      }
      
      return filteredProgressions;
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

// New function to request a chord progression generation via Firebase Function
export const requestChordProgression = async (params: GenerationParams): Promise<ChordProgression | null> => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a random progression from mock data
    const randomIndex = Math.floor(Math.random() * mockProgressions.length);
    return mockProgressions[randomIndex];
  } else {
    try {
      // Call the Firebase Function to generate a chord progression
      const generateChordProgression = httpsCallable<GenerationParams, { progression: ChordProgression }>(
        functions, 
        'generateChordProgression'
      );
      
      // Show a loading state for at least 1 second to avoid UI flicker
      const startTime = Date.now();
      const result = await generateChordProgression(params);
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      
      // If the API call was very fast, add a small delay for better UX
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime));
      }
      
      // Extract the progression from the result
      const progression = result.data.progression;
      
      // Convert string chords to Chord objects if needed
      let processedChords;
      if (Array.isArray(progression.chords) && typeof progression.chords[0] === 'string') {
        processedChords = (progression.chords as string[]).map(chord => ({
          name: chord,
          notation: chord
        }));
      } else {
        processedChords = progression.chords;
      }
      
      return {
        ...progression,
        chords: processedChords
      } as ChordProgression;
    } catch (error) {
      console.error('Error requesting chord progression:', error);
      return null;
    }
  }
};

// New function to check if progressions exist for the given parameters
export const checkProgressionsExist = async (params: GenerationParams): Promise<boolean> => {
  if (USE_MOCK_DATA) {
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

    if (params.startingChord) {
      filtered = filtered.filter(prog => 
        prog.chords && 
        prog.chords.length > 0 && 
        (typeof prog.chords[0] === 'string' 
          ? prog.chords[0] === params.startingChord
          : prog.chords[0].name === params.startingChord)
      );
    }
    
    return filtered.length > 0;
  } else {
    try {
      // Create a query against the progressions collection
      let q = query(collection(db, PROGRESSIONS_COLLECTION));
      
      // Add filters based on params - only add filters for non-empty parameters
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

      if (params.startingChord) {
        // We need to filter for starting chord in the application code
        // since we can't directly query for the first element of an array in Firestore
        q = query(q, where('startingChord', '==', params.startingChord));
      }
      
      // Limit to 1 progression
      q = query(q, limit(1));
      
      const querySnapshot = await getDocs(q);
      
      // If we're filtering by startingChord and we don't have a startingChord field in Firestore
      // we need to check the first chord in the array
      if (params.startingChord && !querySnapshot.empty) {
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
        
        // Check if any progression has the requested starting chord
        return progressions.some(prog => 
          prog.chords && 
          prog.chords.length > 0 && 
          (typeof prog.chords[0] === 'string' 
            ? prog.chords[0] === params.startingChord
            : prog.chords[0].name === params.startingChord)
        );
      }
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking progressions exist:', error);
      return false;
    }
  }
};

/**
 * Report a progression for low quality
 */
export const reportProgression = async (progressionId: string, reason: string): Promise<void> => {
  try {
    const progressionRef = doc(db, PROGRESSIONS_COLLECTION, progressionId);
    
    // Update the progression document
    await updateDoc(progressionRef, {
      reported: true,
      reportReason: reason,
      reportedAt: serverTimestamp()
    });
    
    // Also add to a separate reports collection for easier querying
    const reportRef = doc(collection(db, 'reports'));
    await setDoc(reportRef, {
      progressionId,
      reason,
      createdAt: serverTimestamp(),
      status: 'pending' // pending, regenerated, dismissed
    });
    
    console.log(`Progression ${progressionId} reported for: ${reason}`);
  } catch (error) {
    console.error('Error reporting progression:', error);
    throw error;
  }
};

/**
 * Get reported progressions (for admin use)
 */
export const getReportedProgressions = async (): Promise<ChordProgression[]> => {
  try {
    // Query progressions that have been reported
    const q = query(
      collection(db, PROGRESSIONS_COLLECTION),
      where('reported', '==', true),
      orderBy('reportedAt', 'desc'),
      limit(50)
    );
    
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
    console.error('Error getting reported progressions:', error);
    return [];
  }
};

/**
 * Dismiss a reported progression (mark as reviewed without regenerating)
 */
export const dismissReportedProgression = async (progressionId: string): Promise<void> => {
  try {
    const progressionRef = doc(db, PROGRESSIONS_COLLECTION, progressionId);
    
    // Update the progression document
    await updateDoc(progressionRef, {
      reported: false,
      reportReason: null,
      reportedAt: null
    });
    
    // Update any reports for this progression
    const reportsQuery = query(
      collection(db, 'reports'),
      where('progressionId', '==', progressionId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(reportsQuery);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'dismissed',
        resolvedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`Progression ${progressionId} report dismissed`);
  } catch (error) {
    console.error('Error dismissing reported progression:', error);
    throw error;
  }
};
