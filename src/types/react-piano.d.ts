declare module 'react-piano' {
  export interface PianoProps {
    noteRange: {
      first: number;
      last: number;
    };
    playNote: (midiNumber: number) => void;
    stopNote: (midiNumber: number) => void;
    activeNotes?: number[];
    width?: number;
    className?: string;
    keyboardShortcuts?: any[];
    disabled?: boolean;
    onPlayNoteInput?: (midiNumber: number, { prevActiveNotes }: { prevActiveNotes: number[] }) => void;
    onStopNoteInput?: (midiNumber: number, { prevActiveNotes }: { prevActiveNotes: number[] }) => void;
  }

  export const Piano: React.FC<PianoProps>;
  
  export const KeyboardShortcuts: {
    create: (config: {
      firstNote: number;
      lastNote: number;
      keyboardConfig: any;
    }) => any[];
    HOME_ROW: any;
  };
  
  export const MidiNumbers: {
    fromNote: (note: string) => number;
    NATURAL_MIDI_NUMBERS: number[];
  };
}
