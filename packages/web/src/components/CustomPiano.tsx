import React from 'react';

// Define piano key types
interface NoteAttributes {
  note: string;
  pitchName: string;
  octave: number;
  midiNumber: number;
  isAccidental: boolean;
}

interface CustomPianoProps {
  activeNotes: number[];
  startOctave?: number;
  endOctave?: number;
  className?: string;
}

// Constants for piano layout
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVE_WIDTH = 7; // 7 natural keys per octave

// Pitch positions from the original react-piano implementation
const PITCH_POSITIONS = {
  C: 0,
  'C#': 0.55,
  D: 1,
  'D#': 1.8,
  E: 2,
  F: 3,
  'F#': 3.5,
  G: 4,
  'G#': 4.7,
  A: 5,
  'A#': 5.85,
  B: 6,
};

// Helper function to convert ratio to percentage string
const ratioToPercentage = (ratio: number): string => {
  return `${ratio * 100}%`;
};

// Helper function to get note attributes from MIDI number
const getAttributesFromMidiNumber = (midiNumber: number): NoteAttributes => {
  const octave = Math.floor((midiNumber - 12) / 12);
  const noteIndex = (midiNumber - 12) % 12;
  const pitchName = NOTES[noteIndex];
  
  return {
    note: `${pitchName}${octave}`,
    pitchName,
    octave,
    midiNumber,
    isAccidental: pitchName.includes('#'),
  };
};

// Helper function to get MIDI number from note name
const getMidiNumberFromNote = (note: string): number => {
  const pitchName = note.replace(/\d+$/, '');
  const octave = parseInt(note.slice(-1));
  const noteIndex = NOTES.indexOf(pitchName);
  
  if (noteIndex === -1) return -1;
  return 12 * (octave + 1) + noteIndex;
};

const CustomPiano: React.FC<CustomPianoProps> = ({
  activeNotes,
  startOctave = 3,
  endOctave = 4,
  className = '',
}) => {
  // Generate all MIDI numbers in the range
  const generateMidiNumbers = (): number[] => {
    const firstMidi = getMidiNumberFromNote(`C${startOctave}`);
    const lastMidi = getMidiNumberFromNote(`B${endOctave}`);
    const midiNumbers: number[] = [];
    
    for (let midi = firstMidi; midi <= lastMidi; midi++) {
      midiNumbers.push(midi);
    }
    
    return midiNumbers;
  };

  const midiNumbers = generateMidiNumbers();
  const firstNote = midiNumbers[0];
  
  // Get the absolute position of a key (in natural key widths)
  const getAbsoluteKeyPosition = (midiNumber: number): number => {
    const { octave, pitchName } = getAttributesFromMidiNumber(midiNumber);
    // Use type assertion to ensure TypeScript knows pitchName is a valid key
    const pitchPosition = PITCH_POSITIONS[pitchName as keyof typeof PITCH_POSITIONS];
    const octavePosition = OCTAVE_WIDTH * octave;
    return pitchPosition + octavePosition;
  };

  // Get the position relative to the first key
  const getRelativeKeyPosition = (midiNumber: number): number => {
    return getAbsoluteKeyPosition(midiNumber) - getAbsoluteKeyPosition(firstNote);
  };

  // Count natural keys for width calculation
  const naturalKeyCount = midiNumbers.filter(
    midi => !getAttributesFromMidiNumber(midi).isAccidental
  ).length;
  
  // Calculate natural key width as ratio
  const naturalKeyWidth = 1 / naturalKeyCount;
  
  // Accidental width ratio from the original implementation
  const accidentalWidthRatio = 0.65;

  return (
    <div 
      className={`ReactPiano__Keyboard ${className}`} 
      style={{ 
        position: 'relative',
        height: '120px',
        width: '100%'
      }}
    >
      {midiNumbers.map(midiNumber => {
        const { isAccidental, pitchName } = getAttributesFromMidiNumber(midiNumber);
        const isActive = activeNotes.includes(midiNumber);
        
        return (
          <div
            key={midiNumber}
            className={`ReactPiano__Key ${
              isAccidental ? 'ReactPiano__Key--accidental' : 'ReactPiano__Key--natural'
            } ${isActive ? 'ReactPiano__Key--active' : ''}`}
            style={{
              position: isAccidental ? 'absolute' : 'relative',
              left: isAccidental 
                ? ratioToPercentage(getRelativeKeyPosition(midiNumber) * naturalKeyWidth) 
                : undefined,
              width: ratioToPercentage(
                isAccidental ? accidentalWidthRatio * naturalKeyWidth : naturalKeyWidth
              ),
              height: isAccidental ? '66%' : '100%',
            }}
          >
            <div className="ReactPiano__NoteLabelContainer">
              <div className={`ReactPiano__NoteLabel ReactPiano__NoteLabel--${
                isAccidental ? 'accidental' : 'natural'
              } ${isActive ? 'ReactPiano__NoteLabel--active' : ''}`}>
                {pitchName}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomPiano;
