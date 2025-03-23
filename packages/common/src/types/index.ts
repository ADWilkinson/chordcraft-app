import { Timestamp } from 'firebase/firestore';

export interface ChordProgression {
  id: string;
  key: string;
  scale: string;
  mood: string;
  style: string;
  chords: (string | { name: string; notation?: string })[];
  qualityScore?: number;
  isAIGenerated?: boolean;
  createdAt: Timestamp;
  likes?: number;
  flags?: number;
  reported?: boolean;
}

export interface UserFavorite {
  userId: string;
  progressionId: string;
  createdAt: Timestamp;
}

export interface ProgressionReport {
  progressionId: string;
  reason: string;
  details: string;
  createdAt: Timestamp;
}