export type Chord = {
  name: string;
  notation: string;
  function?: string;
};

export type ChordProgression = {
  id: string;
  chords: Chord[];
  key: string;
  scale: string;
  mood: string;
  style: string;
  insights: string[];
  createdAt: Date;
  likes: number;
  flags: number;
};

export type GenerationParams = {
  key?: string;
  scale?: string;
  startingChord?: string;
  mood?: string;
  style?: string;
};

export type MusicKey = {
  name: string;
  value: string;
};

export type MusicScale = {
  name: string;
  value: string;
};

export type MusicMood = {
  name: string;
  value: string;
};

export type MusicStyle = {
  name: string;
  value: string;
};
