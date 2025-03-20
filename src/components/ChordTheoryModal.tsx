import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ChordTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chordName: string;
  keyContext: string;
}

const ChordTheoryModal = ({ isOpen, onClose, chordName, keyContext }: ChordTheoryModalProps) => {
  // This would ideally come from a database or API
  // For now, we'll use some static data based on common chord theory
  const getChordInfo = (chord: string, key: string) => {
    // Extract the root note and quality
    const rootNote = chord.replace(/m|maj|min|dim|aug|sus|add|\d+/g, '');
    const quality = chord.includes('m') && !chord.includes('maj') ? 'minor' : 'major';
    
    // Basic chord descriptions
    const descriptions: Record<string, string> = {
      major: 'A bright, happy-sounding chord built with a major third and perfect fifth.',
      minor: 'A darker, more melancholic chord built with a minor third and perfect fifth.',
      dim: 'A dissonant, tense chord built with a minor third and diminished fifth.',
      aug: 'An unusual, dreamy chord built with a major third and augmented fifth.',
      sus4: 'A suspended chord where the third is replaced by a perfect fourth, creating an unresolved feeling.',
      sus2: 'A suspended chord where the third is replaced by a major second, creating an open sound.',
      '7': 'A dominant seventh chord that creates tension and wants to resolve.',
      'maj7': 'A major seventh chord that sounds jazzy and sophisticated.',
      'm7': 'A minor seventh chord that sounds jazzy but with a melancholic quality.',
    };
    
    // Determine the chord quality for description
    let description = descriptions.major;
    if (chord.includes('dim')) description = descriptions.dim;
    else if (chord.includes('aug')) description = descriptions.aug;
    else if (chord.includes('sus4')) description = descriptions.sus4;
    else if (chord.includes('sus2')) description = descriptions.sus2;
    else if (chord.includes('maj7')) description = descriptions.maj7;
    else if (chord.includes('m7')) description = descriptions.m7;
    else if (chord.includes('7')) description = descriptions['7'];
    else if (quality === 'minor') description = descriptions.minor;
    
    // Determine common notes in the chord
    const noteMap: Record<string, string[]> = {
      'C': ['C', 'E', 'G'],
      'Cm': ['C', 'E♭', 'G'],
      'D': ['D', 'F♯', 'A'],
      'Dm': ['D', 'F', 'A'],
      'E': ['E', 'G♯', 'B'],
      'Em': ['E', 'G', 'B'],
      'F': ['F', 'A', 'C'],
      'Fm': ['F', 'A♭', 'C'],
      'G': ['G', 'B', 'D'],
      'Gm': ['G', 'B♭', 'D'],
      'A': ['A', 'C♯', 'E'],
      'Am': ['A', 'C', 'E'],
      'B': ['B', 'D♯', 'F♯'],
      'Bm': ['B', 'D', 'F♯'],
    };
    
    // Simplify the chord name to match our noteMap keys
    let simpleChord = rootNote;
    if (quality === 'minor') simpleChord += 'm';
    
    const notes = noteMap[simpleChord] || ['Notes not available'];
    
    // Function in the key
    const functions: Record<string, Record<string, string>> = {
      'C': {
        'C': 'I (Tonic)',
        'Dm': 'ii (Supertonic)',
        'Em': 'iii (Mediant)',
        'F': 'IV (Subdominant)',
        'G': 'V (Dominant)',
        'Am': 'vi (Submediant)',
        'Bdim': 'vii° (Leading Tone)',
      },
      // Add more keys as needed
    };
    
    const chordFunction = functions[key]?.[simpleChord] || 'Function not available';
    
    return {
      description,
      notes,
      function: chordFunction,
      commonUse: `${chord} is commonly used in ${key} to ${quality === 'minor' ? 'add melancholy or tension' : 'establish harmony or resolution'}.`
    };
  };
  
  const chordInfo = getChordInfo(chordName, keyContext);
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900"
                  >
                    {chordName} Chord Theory
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-sm text-gray-700">{chordInfo.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <div className="mt-2 flex space-x-2">
                      {chordInfo.notes.map((note, index) => (
                        <motion.div
                          key={note}
                          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="text-sm font-medium">{note}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Function in {keyContext}</h4>
                    <p className="mt-1 text-sm text-gray-700">{chordInfo.function}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Common Use</h4>
                    <p className="mt-1 text-sm text-gray-700">{chordInfo.commonUse}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ChordTheoryModal;
