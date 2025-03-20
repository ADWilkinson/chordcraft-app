import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Define common chord types and their corresponding intervals
const chordIntervals: Record<string, number[]> = {
  '': [0, 4, 7], // Major
  'm': [0, 3, 7], // Minor
  '7': [0, 4, 7, 10], // Dominant 7th
  'maj7': [0, 4, 7, 11], // Major 7th
  'm7': [0, 3, 7, 10], // Minor 7th
  'dim': [0, 3, 6], // Diminished
  'aug': [0, 4, 8], // Augmented
  'sus4': [0, 5, 7], // Suspended 4th
  'sus2': [0, 2, 7], // Suspended 2nd
  '6': [0, 4, 7, 9], // Major 6th
  'm6': [0, 3, 7, 9], // Minor 6th
  '9': [0, 4, 7, 10, 14], // Dominant 9th
  'add9': [0, 4, 7, 14], // Add 9
};

// Define note names
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface ChordVisualizerProps {
  chord: string;
  numeral?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ChordVisualizer = ({ 
  chord, 
  numeral, 
  isActive = false, 
  onClick 
}: ChordVisualizerProps) => {
  const [chordNotes, setChordNotes] = useState<string[]>([]);
  
  // Parse chord to get its notes
  useEffect(() => {
    const parseChord = (chordName: string) => {
      // Handle slash chords (e.g., C/G)
      const [mainChord, bassNote] = chordName.split('/');
      
      // Extract root note and chord type
      let rootNote = '';
      let chordType = '';
      
      if (mainChord.length > 1 && (mainChord[1] === '#' || mainChord[1] === 'b')) {
        rootNote = mainChord.substring(0, 2);
        chordType = mainChord.substring(2);
      } else {
        rootNote = mainChord.substring(0, 1);
        chordType = mainChord.substring(1);
      }
      
      // Find root note index
      const rootIndex = noteNames.findIndex(note => note === rootNote);
      if (rootIndex === -1) return ['?'];
      
      // Get intervals for this chord type
      let intervals = chordIntervals[''];  // Default to major
      
      // Check for specific chord types
      for (const [type, ints] of Object.entries(chordIntervals)) {
        if (chordType === type || chordType.startsWith(type)) {
          intervals = ints;
          break;
        }
      }
      
      // Generate notes from intervals
      const notes = intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return noteNames[noteIndex];
      });
      
      // Add bass note if it's a slash chord
      if (bassNote) {
        // Move the bass note to the front if it's already in the chord
        const existingBassIndex = notes.findIndex(note => note === bassNote);
        if (existingBassIndex !== -1) {
          notes.splice(existingBassIndex, 1);
        }
        notes.unshift(bassNote);
      }
      
      return notes;
    };
    
    setChordNotes(parseChord(chord));
  }, [chord]);

  return (
    <motion.div
      className={`
        p-4 rounded-lg border cursor-pointer relative overflow-hidden
        ${isActive 
          ? 'border-zinc-500 bg-zinc-800 text-white' 
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
        }
        transition-all duration-300
      `}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Visual chord representation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-300 to-zinc-400"></div>
      
      <div className="flex flex-col items-center justify-center">
        <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-zinc-900'}`}>
          {chord}
        </span>
        
        {numeral && (
          <span className={`text-xs ${isActive ? 'text-zinc-300' : 'text-zinc-500'} mt-1 font-medium`}>
            {numeral}
          </span>
        )}
        
        {/* Chord notes visualization */}
        <div className="mt-3 flex justify-center space-x-1">
          {chordNotes.map((note, index) => (
            <div 
              key={`${note}-${index}`}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isActive 
                  ? index === 0 
                    ? 'bg-white text-zinc-800' 
                    : 'bg-zinc-600 text-white'
                  : index === 0 
                    ? 'bg-zinc-800 text-white' 
                    : 'bg-zinc-100 text-zinc-800'
                }
              `}
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChordVisualizer;
