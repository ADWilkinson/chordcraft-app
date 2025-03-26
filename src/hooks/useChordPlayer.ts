import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { MidiNumbers } from "react-piano";
import { getChordName, getChordNotes } from "../utils/chordUtils";
import { Chord } from "../types";

interface UseChordPlayerOptions {
  tempo?: number;
  autoAdvance?: boolean;
}

interface UseChordPlayerResult {
  isPlaying: boolean;
  currentChordIndex: number;
  activeMidiNumbers: number[];
  activeNotes: string[];
  isReady: boolean;
  playChord: (index: number) => Promise<void>;
  stopPlayback: () => void;
  togglePlayback: () => void;
  setTempo: (value: number) => void;
  convertNotesToMidi: (notes: string[]) => number[];
}

/**
 * Custom hook for playing chord progressions with Tone.js
 */
export const useChordPlayer = (
  chords: Array<string | Chord | { name: string }>,
  options: UseChordPlayerOptions = {}
): UseChordPlayerResult => {
  const { tempo = 80, autoAdvance = true } = options;

  // State for player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempoValue, setTempoValue] = useState(tempo);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [activeMidiNumbers, setActiveMidiNumbers] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Refs for audio playback
  const isPlayingRef = useRef(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const currentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transportIdRef = useRef<NodeJS.Timeout[]>([]);

  // Reset playback when chords change
  useEffect(() => {
    if (isPlaying) {
      stopPlayback();
    }
    setCurrentChordIndex(-1);
    setActiveNotes([]);
  }, [chords]);

  // Initialize synth
  useEffect(() => {
    const initSynth = async () => {
      if (!synthRef.current) {
        try {
          await Tone.start();

          const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
              type: "sine",
            },
            envelope: {
              attack: 0.005,
              decay: 0.1,
              sustain: 0.3,
              release: 1,
            },
          }).toDestination();

          synthRef.current = synth;
          setIsReady(true);
        } catch (error) {
          console.error("Failed to initialize Tone.js:", error);
        }
      }
    };

    initSynth();

    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }

      if (currentTimeoutRef.current) {
        clearTimeout(currentTimeoutRef.current);
      }

      transportIdRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  // Convert note names to MIDI numbers for react-piano
  const convertNotesToMidi = useCallback((notes: string[]): number[] => {
    return notes.map((note) => {
      // Extract note name and octave
      const noteName = note.replace(/\d+$/, "");
      const octave = parseInt(note.slice(-1));

      // Convert to MIDI number
      return MidiNumbers.fromNote(`${noteName.toLowerCase()}${octave}`);
    });
  }, []);

  // Play a chord
  const playChord = useCallback(
    async (index: number) => {
      if (!isPlayingRef.current || index >= chords.length) {
        if (index >= chords.length) {
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
        return;
      }

      try {
        if (!synthRef.current) {
          return;
        }

        const chord = chords[index];
        const chordName = getChordName(chord);

        setCurrentChordIndex(index);

        // Get notes for the chord
        const notes = getChordNotes(chordName);
        setActiveNotes(notes);

        // Convert to MIDI numbers for visualization
        const midiNumbers = convertNotesToMidi(notes);
        setActiveMidiNumbers(midiNumbers);

        // Play the chord
        const now = Tone.now();
        synthRef.current.triggerAttackRelease(notes, "2n", now);

        // Set up the next chord if auto advance is enabled
        if (autoAdvance && index < chords.length - 1) {
          const nextChordDelay = (60 / tempoValue) * 1000 * 2; // Convert BPM to ms for a half note

          currentTimeoutRef.current = setTimeout(() => {
            playChord(index + 1);
          }, nextChordDelay);

          transportIdRef.current.push(currentTimeoutRef.current);
        }
      } catch (error) {
        console.error("Error playing chord:", error);
      }
    },
    [chords, tempoValue, convertNotesToMidi, autoAdvance]
  );

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;

    if (currentTimeoutRef.current) {
      clearTimeout(currentTimeoutRef.current);
      currentTimeoutRef.current = null;
    }

    transportIdRef.current.forEach((id) => clearTimeout(id));
    transportIdRef.current = [];

    setActiveNotes([]);
    setActiveMidiNumbers([]);
  }, []);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (!isReady) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;

      const startIndex = currentChordIndex >= 0 && currentChordIndex < chords.length - 1 ? currentChordIndex + 1 : 0;

      playChord(startIndex);
    }
  }, [isPlaying, currentChordIndex, chords.length, playChord, stopPlayback, isReady]);

  return {
    isPlaying,
    currentChordIndex,
    activeMidiNumbers,
    activeNotes,
    isReady,
    playChord,
    stopPlayback,
    togglePlayback,
    setTempo: setTempoValue,
    convertNotesToMidi,
  };
};
