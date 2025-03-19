import { collection, query, where, getDocs, updateDoc, doc, getDoc, orderBy, limit, increment as firestoreIncrement } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChordProgression, GenerationParams } from '../types';
import { mockProgressions } from '../mock/progressions';

const PROGRESSIONS_COLLECTION = 'progressions';

// For development, use mock data
const USE_MOCK_DATA = true;

export const fetchProgressions = async (params: GenerationParams): Promise<ChordProgression[]> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock data based on params
    let filtered = [...mockProgressions];
    
    if (params.key) {
      filtered = filtered.filter(p => p.key === params.key);
    }
    
    if (params.scale) {
      filtered = filtered.filter(p => p.scale === params.scale);
    }
    
    if (params.mood) {
      filtered = filtered.filter(p => p.mood === params.mood);
    }
    
    if (params.style) {
      filtered = filtered.filter(p => p.style === params.style);
    }
    
    // Add ordering by likes (most popular first)
    filtered.sort((a, b) => b.likes - a.likes);
    
    // Limit to 10 results
    filtered = filtered.slice(0, 10);
    
    return filtered;
  }
  
  // Real implementation for production
  try {
    let q = collection(db, PROGRESSIONS_COLLECTION);
    
    // Build query based on provided parameters
    const constraints = [];
    
    if (params.key) {
      constraints.push(where('key', '==', params.key));
    }
    
    if (params.scale) {
      constraints.push(where('scale', '==', params.scale));
    }
    
    if (params.mood) {
      constraints.push(where('mood', '==', params.mood));
    }
    
    if (params.style) {
      constraints.push(where('style', '==', params.style));
    }
    
    // Add ordering by likes (most popular first)
    constraints.push(orderBy('likes', 'desc'));
    
    // Limit to 10 results
    constraints.push(limit(10));
    
    const querySnapshot = await getDocs(query(q, ...constraints));
    
    const progressions: ChordProgression[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      progressions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as ChordProgression);
    });
    
    return progressions;
  } catch (error) {
    console.error('Error fetching progressions:', error);
    throw error;
  }
};

export const getProgressionById = async (id: string): Promise<ChordProgression | null> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const progression = mockProgressions.find(p => p.id === id);
    return progression || null;
  }
  
  // Real implementation for production
  try {
    const docRef = doc(db, PROGRESSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as ChordProgression;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting progression:', error);
    throw error;
  }
};

export const likeProgression = async (id: string): Promise<void> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const progression = mockProgressions.find(p => p.id === id);
    if (progression) {
      progression.likes += 1;
    }
    return;
  }
  
  // Real implementation for production
  try {
    const docRef = doc(db, PROGRESSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      likes: firestoreIncrement(1)
    });
  } catch (error) {
    console.error('Error liking progression:', error);
    throw error;
  }
};

export const flagProgression = async (id: string): Promise<void> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const progression = mockProgressions.find(p => p.id === id);
    if (progression) {
      progression.flags += 1;
    }
    return;
  }
  
  // Real implementation for production
  try {
    const docRef = doc(db, PROGRESSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      flags: firestoreIncrement(1)
    });
  } catch (error) {
    console.error('Error flagging progression:', error);
    throw error;
  }
};
