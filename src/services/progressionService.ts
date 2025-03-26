import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  serverTimestamp,
  increment as firestoreIncrement,
  writeBatch,
  setDoc,
  startAfter as firestoreStartAfter,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/config";
import { ChordProgression, GenerationParams } from "../types";
import { mockProgressions } from "../mock/progressions";
import { getCachedItem, setCachedItem } from "./cacheService";

const PROGRESSIONS_COLLECTION = "progressions";

// For development, use mock data or real Firebase
// Set to false to use real Firebase
const USE_MOCK_DATA = false;

/**
 * Find chord progressions based on the provided parameters
 */
export const findProgressions = async (
  params: GenerationParams & {
    limit?: number;
    startAfter?: string;
  }
): Promise<ChordProgression[]> => {
  try {
    const { limit: queryLimit = 5, startAfter } = params;

    // Check if we have a cached version of this query
    const cacheKey = `progressions_${JSON.stringify(params)}`;
    const cachedProgressions = getCachedItem<ChordProgression[]>(cacheKey);

    if (cachedProgressions) {
      console.log("Using cached progressions for query:", params);
      return cachedProgressions;
    }

    // Create a query against the progressions collection
    let q = query(collection(db, PROGRESSIONS_COLLECTION));

    // Add filters based on params - only add filters for non-empty parameters
    if (params.key && params.key.trim() !== "") {
      q = query(q, where("key", "==", params.key));
    }

    if (params.scale && params.scale.trim() !== "") {
      q = query(q, where("scale", "==", params.scale));
    }

    if (params.mood && params.mood.trim() !== "") {
      q = query(q, where("mood", "==", params.mood));
    }

    if (params.style && params.style.trim() !== "") {
      q = query(q, where("style", "==", params.style));
    }

    // Only add these filters if we're not doing a completely empty search
    // This is because Firebase doesn't support != and >= in the same query
    const hasAnyFilter = params.key || params.scale || params.mood || params.style || params.startingChord;

    if (hasAnyFilter) {
      // Add a filter to exclude reported progressions
      q = query(q, where("reported", "!=", true));

      // Add a filter for quality score if available
      q = query(q, where("qualityScore", ">=", 70));
    }

    // Add a filter for starting chord if provided
    if (params.startingChord && params.startingChord.trim() !== "") {
      q = query(q, where("startingChord", "==", params.startingChord));
    }

    // Order by likes (descending) and then by creation date (descending)
    q = query(q, orderBy("likes", "desc"), orderBy("createdAt", "desc"));

    // Add pagination support with startAfter if provided
    if (startAfter) {
      const docRef = doc(db, PROGRESSIONS_COLLECTION, startAfter);
      const startAfterDoc = await getDoc(docRef);

      if (startAfterDoc.exists()) {
        q = query(q, firestoreStartAfter(startAfterDoc));
      }
    }

    // Limit the results
    q = query(q, limit(queryLimit));

    console.log("Executing Firestore query with params:", JSON.stringify(params));

    const querySnapshot = await getDocs(q);
    const progressions: ChordProgression[] = [];

    console.log(`Query returned ${querySnapshot.size} documents`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert string chords to Chord objects if needed
      let chords = data.chords;
      if (Array.isArray(chords) && typeof chords[0] === "string") {
        chords = chords.map((chord) => ({
          name: chord,
          notation: chord,
        }));
      }

      // If we're filtering by startingChord and we don't have a startingChord field,
      // check the first chord in the array
      if (params.startingChord && !data.startingChord) {
        const firstChord = typeof chords[0] === "string" ? chords[0] : chords[0].name;
        if (firstChord !== params.startingChord) {
          return; // Skip this progression if it doesn't start with the requested chord
        }
      }

      progressions.push({
        id: doc.id,
        ...data,
        chords,
      } as ChordProgression);
    });

    // Cache the results for future use (5 minutes TTL)
    setCachedItem(cacheKey, progressions, { ttl: 5 * 60 * 1000 });

    return progressions;
  } catch (error) {
    console.error("Error finding progressions:", error);
    return [];
  }
};

export const fetchProgressions = async (params: GenerationParams): Promise<ChordProgression[]> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    return mockProgressions;
  }

  try {
    // First, try to find existing progressions with the given parameters
    const progressions = await findProgressions(params);

    // Return whatever we found, even if it's an empty array
    return progressions;
  } catch (error) {
    console.error("Error fetching progressions:", error);
    throw error;
  }
};

export const fetchRandomProgression = async (): Promise<ChordProgression | null> => {
  // For development, use mock data
  if (USE_MOCK_DATA) {
    const randomIndex = Math.floor(Math.random() * mockProgressions.length);
    return mockProgressions[randomIndex];
  }

  try {
    // Check if we have a cached random progression set
    const cacheKey = "random_progressions_set";
    let cachedProgressions = getCachedItem<ChordProgression[]>(cacheKey);

    if (cachedProgressions && cachedProgressions.length > 0) {
      // Pick a random progression from the cached set
      const randomIndex = Math.floor(Math.random() * cachedProgressions.length);
      const selectedProgression = cachedProgressions[randomIndex];

      // Remove the used progression from the cache
      cachedProgressions = cachedProgressions.filter((_, i) => i !== randomIndex);
      setCachedItem(cacheKey, cachedProgressions, { ttl: 30 * 60 * 1000 });

      return selectedProgression;
    }

    // Create a query against the progressions collection
    // We'll get a random progression by:
    // 1. Only including progressions with a quality score >= 70
    // 2. Using a random ordering approach with a random field
    // 3. Limiting to 100 results and then filtering out reported progressions

    // Generate a random value between 0 and 1
    const randomValue = Math.random();

    // Create two different queries with different orderings to randomize results
    let q;
    if (randomValue < 0.5) {
      // 50% chance to order by qualityScore ascending
      q = query(
        collection(db, PROGRESSIONS_COLLECTION),
        where("qualityScore", ">=", 70),
        orderBy("qualityScore", "asc"),
        limit(100)
      );
    } else {
      // 50% chance to order by qualityScore descending
      q = query(
        collection(db, PROGRESSIONS_COLLECTION),
        where("qualityScore", ">=", 70),
        orderBy("qualityScore", "desc"),
        limit(100)
      );
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Convert to array of progressions and filter out reported ones
    const progressions: ChordProgression[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include progressions that aren't reported
      if (!data.reported) {
        progressions.push({ id: doc.id, ...data } as ChordProgression);
      }
    });

    if (progressions.length === 0) {
      return null;
    }

    // Shuffle the array for additional randomness
    const shuffledProgressions = [...progressions].sort(() => Math.random() - 0.5);

    // Cache the progressions for future random picks
    setCachedItem(cacheKey, shuffledProgressions, { ttl: 30 * 60 * 1000 });

    // Pick a random progression from the shuffled results
    const randomIndex = Math.floor(Math.random() * shuffledProgressions.length);
    return shuffledProgressions[randomIndex];
  } catch (error) {
    console.error("Error fetching random progression:", error);
    return null;
  }
};

export const likeProgression = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data and increment likes
    const progression = mockProgressions.find((p) => p.id === id);
    if (progression) {
      progression.likes += 1;
    }
  } else {
    try {
      // Get a reference to the progression document
      const progressionRef = doc(db, PROGRESSIONS_COLLECTION, id);

      // Increment the likes field
      await updateDoc(progressionRef, {
        likes: firestoreIncrement(1),
      });
    } catch (error) {
      console.error("Error liking progression:", error);
      throw error;
    }
  }
};

export const flagProgression = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data and increment flags
    const progression = mockProgressions.find((p) => p.id === id);
    if (progression) {
      progression.flags = (progression.flags || 0) + 1;
    }
  } else {
    try {
      // Get a reference to the progression document
      const progressionRef = doc(db, PROGRESSIONS_COLLECTION, id);

      // Increment the flags field
      await updateDoc(progressionRef, {
        flags: firestoreIncrement(1),
      });
    } catch (error) {
      console.error("Error flagging progression:", error);
      throw error;
    }
  }
};

// New function to create a progression in Firestore
export const createProgression = async (progression: Omit<ChordProgression, "id" | "createdAt">): Promise<string> => {
  if (USE_MOCK_DATA) {
    // Create a new progression in mock data
    const newId = (mockProgressions.length + 1).toString();
    const newProgression = {
      ...progression,
      id: newId,
      createdAt: new Date(),
      likes: 0,
      flags: 0,
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
        flags: 0,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating progression:", error);
      throw error;
    }
  }
};

// New function to get a single progression by ID
export const getProgressionById = async (id: string): Promise<ChordProgression | null> => {
  if (USE_MOCK_DATA) {
    // Find the progression in mock data
    const progression = mockProgressions.find((p) => p.id === id);
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
        if (Array.isArray(chords) && typeof chords[0] === "string") {
          chords = chords.map((chord) => ({
            name: chord,
            notation: chord,
          }));
        }

        return {
          id: docSnap.id,
          ...data,
          chords,
        } as ChordProgression;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting progression:", error);
      return null;
    }
  }
};

// New function to request a chord progression generation via Firebase Function
export const requestChordProgression = async (params: GenerationParams): Promise<ChordProgression | null> => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return a random progression from mock data
    const randomIndex = Math.floor(Math.random() * mockProgressions.length);
    return mockProgressions[randomIndex];
  } else {
    try {
      // Call the Firebase Function to generate a chord progression
      const generateChordProgression = httpsCallable<GenerationParams, { progression: ChordProgression }>(
        functions,
        "generateChordProgression"
      );

      // Show a loading state for at least 1 second to avoid UI flicker
      const startTime = Date.now();
      const result = await generateChordProgression(params);
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      // If the API call was very fast, add a small delay for better UX
      if (elapsedTime < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsedTime));
      }

      // Extract the progression from the result
      const progression = result.data.progression;

      // Convert string chords to Chord objects if needed
      let processedChords;
      if (Array.isArray(progression.chords) && typeof progression.chords[0] === "string") {
        processedChords = (progression.chords as string[]).map((chord) => ({
          name: chord,
          notation: chord,
        }));
      } else {
        processedChords = progression.chords;
      }

      return {
        ...progression,
        chords: processedChords,
      } as ChordProgression;
    } catch (error) {
      console.error("Error requesting chord progression:", error);
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
      filtered = filtered.filter((prog) => prog.key === params.key);
    }

    if (params.scale) {
      filtered = filtered.filter((prog) => prog.scale === params.scale);
    }

    if (params.mood) {
      filtered = filtered.filter((prog) => prog.mood === params.mood);
    }

    if (params.style) {
      filtered = filtered.filter((prog) => prog.style === params.style);
    }

    if (params.startingChord) {
      filtered = filtered.filter(
        (prog) =>
          prog.chords &&
          prog.chords.length > 0 &&
          (typeof prog.chords[0] === "string"
            ? prog.chords[0] === params.startingChord
            : prog.chords[0].name === params.startingChord)
      );
    }

    return filtered.length > 0;
  } else {
    try {
      // Create a query against the progressions collection
      let q = query(
        collection(db, PROGRESSIONS_COLLECTION),
        where("reported", "!=", true),
        where("qualityScore", ">=", 70)
      );

      // Add filters based on params - only add filters for non-empty parameters
      if (params.key) {
        q = query(q, where("key", "==", params.key));
      }

      if (params.scale) {
        q = query(q, where("scale", "==", params.scale));
      }

      if (params.mood) {
        q = query(q, where("mood", "==", params.mood));
      }

      if (params.style) {
        q = query(q, where("style", "==", params.style));
      }

      if (params.startingChord) {
        // We need to filter for starting chord in the application code
        // since we can't directly query for the first element of an array in Firestore
        q = query(q, where("startingChord", "==", params.startingChord));
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
          if (Array.isArray(chords) && typeof chords[0] === "string") {
            chords = chords.map((chord) => ({
              name: chord,
              notation: chord,
            }));
          }

          progressions.push({
            id: doc.id,
            ...data,
            chords,
          } as ChordProgression);
        });

        // Check if any progression has the requested starting chord
        return progressions.some(
          (prog) =>
            prog.chords &&
            prog.chords.length > 0 &&
            (typeof prog.chords[0] === "string"
              ? prog.chords[0] === params.startingChord
              : prog.chords[0].name === params.startingChord)
        );
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking progressions exist:", error);
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
      reportedAt: serverTimestamp(),
    });

    // Also add to a separate reports collection for easier querying
    const reportRef = doc(collection(db, "reports"));
    await setDoc(reportRef, {
      progressionId,
      reason,
      createdAt: serverTimestamp(),
      status: "pending", // pending, regenerated, dismissed
    });

    console.log(`Progression ${progressionId} reported for: ${reason}`);
  } catch (error) {
    console.error("Error reporting progression:", error);
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
      where("reported", "==", true),
      orderBy("reportedAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const progressions: ChordProgression[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert string chords to Chord objects if needed
      let chords = data.chords;
      if (Array.isArray(chords) && typeof chords[0] === "string") {
        chords = chords.map((chord) => ({
          name: chord,
          notation: chord,
        }));
      }

      progressions.push({
        id: doc.id,
        ...data,
        chords,
      } as ChordProgression);
    });

    return progressions;
  } catch (error) {
    console.error("Error getting reported progressions:", error);
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
      reportedAt: null,
    });

    // Update any reports for this progression
    const reportsQuery = query(
      collection(db, "reports"),
      where("progressionId", "==", progressionId),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(reportsQuery);

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "dismissed",
        resolvedAt: serverTimestamp(),
      });
    });

    await batch.commit();

    console.log(`Progression ${progressionId} report dismissed`);
  } catch (error) {
    console.error("Error dismissing reported progression:", error);
    throw error;
  }
};

/**
 * Check and log information about progressions in the database
 */
export const checkProgressionsInDatabase = async (): Promise<void> => {
  try {
    // Check total progressions
    const totalQuery = query(collection(db, PROGRESSIONS_COLLECTION));
    const totalSnapshot = await getDocs(totalQuery);
    console.log(`Total progressions in database: ${totalSnapshot.size}`);

    // Check progressions with quality score >= 70
    const qualityQuery = query(collection(db, PROGRESSIONS_COLLECTION), where("qualityScore", ">=", 70));
    const qualitySnapshot = await getDocs(qualityQuery);
    console.log(`Progressions with quality score >= 70: ${qualitySnapshot.size}`);

    // Log some sample data
    if (qualitySnapshot.size > 0) {
      console.log("Sample progression data:");
      qualitySnapshot.docs.slice(0, 3).forEach((doc) => {
        console.log(doc.id, doc.data());
      });
    }
  } catch (error) {
    console.error("Error checking progressions:", error);
  }
};
