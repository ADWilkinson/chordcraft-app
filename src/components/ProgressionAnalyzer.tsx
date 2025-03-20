import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, LightBulbIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface ProgressionAnalyzerProps {
  chords: string[];
  key: string;
  scale: string;
  insights: string[];
}

const ProgressionAnalyzer = ({ chords, key, scale, insights }: ProgressionAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'common-uses' | 'variations'>('summary');
  
  // Generate common chord progressions in this key
  const getCommonProgressions = (key: string, scale: string) => {
    // Handle undefined or empty key/scale
    if (!key || !scale) {
      return [
        { name: 'Common progression 1', example: 'Example not available for this key' },
        { name: 'Common progression 2', example: 'Example not available for this key' },
      ];
    }
    
    const isMinor = scale.toLowerCase().includes('minor');
    
    if (isMinor) {
      return [
        { name: 'i - VI - VII', example: `${key}m - ${getRelativeChord(key, 6)} - ${getRelativeChord(key, 7)}` },
        { name: 'i - iv - VII', example: `${key}m - ${getRelativeChord(key, 4)}m - ${getRelativeChord(key, 7)}` },
        { name: 'i - iv - v', example: `${key}m - ${getRelativeChord(key, 4)}m - ${getRelativeChord(key, 5)}m` },
        { name: 'i - VI - III - VII', example: `${key}m - ${getRelativeChord(key, 6)} - ${getRelativeChord(key, 3)} - ${getRelativeChord(key, 7)}` },
      ];
    } else {
      return [
        { name: 'I - IV - V', example: `${key} - ${getRelativeChord(key, 4)} - ${getRelativeChord(key, 5)}` },
        { name: 'I - V - vi - IV', example: `${key} - ${getRelativeChord(key, 5)} - ${getRelativeChord(key, 6)}m - ${getRelativeChord(key, 4)}` },
        { name: 'I - vi - IV - V', example: `${key} - ${getRelativeChord(key, 6)}m - ${getRelativeChord(key, 4)} - ${getRelativeChord(key, 5)}` },
        { name: 'ii - V - I', example: `${getRelativeChord(key, 2)}m - ${getRelativeChord(key, 5)} - ${key}` },
      ];
    }
  };
  
  // Helper function to get relative chord based on scale degree
  const getRelativeChord = (rootKey: string, degree: number) => {
    if (!rootKey) return 'C'; // Default to C if no key provided
    
    const majorKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = majorKeys.findIndex(k => k === rootKey);
    
    if (keyIndex === -1) return rootKey;
    
    // Calculate the new index based on the degree
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // Whole and half steps in a major scale
    const newIndex = (keyIndex + intervals[(degree - 1) % 7]) % 12;
    
    return majorKeys[newIndex];
  };
  
  // Generate possible variations of the current progression
  const getVariations = () => {
    // Handle empty chords array
    if (!chords || chords.length === 0) {
      return [
        {
          name: 'No variations available',
          description: 'No chord progression to create variations from',
          example: 'N/A'
        }
      ];
    }
    
    return [
      {
        name: 'Add 7th chords',
        description: 'Add 7ths to some or all chords for a jazzier sound',
        example: chords.map(chord => 
          chord.includes('m') ? `${chord}7` : `${chord}maj7`
        ).join(' - ')
      },
      {
        name: 'Substitute dominant chords',
        description: 'Replace V with V7 or VII7 for more tension',
        example: chords.join(' - ').replace(getRelativeChord(key || 'C', 5), `${getRelativeChord(key || 'C', 5)}7`)
      },
      {
        name: 'Add passing chords',
        description: 'Insert passing chords between existing chords',
        example: chords.length > 1 ? 
          `${chords[0]} - ${getRelativeChord(key || 'C', 3)}m - ${chords[1]} - ${chords.slice(2).join(' - ')}` :
          `${chords[0]} - ${getRelativeChord(key || 'C', 3)}m`
      },
      {
        name: 'Borrowed chords',
        description: 'Borrow chords from the parallel minor/major key',
        example: chords.join(' - ').replace(
          getRelativeChord(key || 'C', 4), 
          (scale || '').toLowerCase().includes('minor') ? getRelativeChord(key || 'C', 4) : `${getRelativeChord(key || 'C', 4)}m`
        )
      }
    ];
  };
  
  const commonProgressions = getCommonProgressions(key, scale);
  const variations = getVariations();
  
  // Analyze the current progression
  const analyzeProgression = () => {
    // Length analysis
    let lengthAnalysis = '';
    if (chords && chords.length > 0) {
      if (chords.length <= 3) {
        lengthAnalysis = 'This is a short progression, which can be effective for creating a simple, memorable hook.';
      } else if (chords.length <= 6) {
        lengthAnalysis = 'This is a medium-length progression, providing a good balance between simplicity and interest.';
      } else {
        lengthAnalysis = 'This is a longer progression, which can create more complex and evolving musical sections.';
      }
    } else {
      lengthAnalysis = 'No progression to analyze.';
    }
    
    // Repetition analysis
    let repetitionAnalysis = '';
    if (chords && chords.length > 0) {
      const uniqueChords = new Set(chords).size;
      if (uniqueChords === chords.length) {
        repetitionAnalysis = 'There are no repeated chords, which creates a constantly evolving sound.';
      } else if (uniqueChords >= chords.length * 0.7) {
        repetitionAnalysis = 'There is some chord repetition, which helps establish the progression.';
      } else {
        repetitionAnalysis = 'There is significant chord repetition, which creates a strong sense of familiarity.';
      }
    } else {
      repetitionAnalysis = 'No progression to analyze.';
    }
    
    return {
      lengthAnalysis,
      repetitionAnalysis
    };
  };
  
  const analysis = analyzeProgression();
  
  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-md overflow-hidden">
      <div className="flex border-b border-zinc-200">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center ${
            activeTab === 'summary' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Summary
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center ${
            activeTab === 'common-uses' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
          }`}
          onClick={() => setActiveTab('common-uses')}
        >
          <MusicalNoteIcon className="h-4 w-4 mr-2" />
          Common Progressions
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center ${
            activeTab === 'variations' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
          }`}
          onClick={() => setActiveTab('variations')}
        >
          <LightBulbIcon className="h-4 w-4 mr-2" />
          Try Variations
        </button>
      </div>
      
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-medium text-zinc-500">Progression Analysis</h3>
                <p className="mt-1 text-sm text-zinc-700">{analysis.lengthAnalysis}</p>
                <p className="mt-1 text-sm text-zinc-700">{analysis.repetitionAnalysis}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-zinc-500">Musical Insights</h3>
                <ul className="mt-2 space-y-2">
                  {insights && insights.length > 0 ? insights.map((insight, index) => (
                    <li key={index} className="text-sm text-zinc-700 flex items-start">
                      <span className="text-zinc-400 mr-2">•</span>
                      {insight}
                    </li>
                  )) : <li className="text-sm text-zinc-700">No insights available.</li>}
                </ul>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'common-uses' && (
            <motion.div
              key="common-uses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-zinc-700">
                Common chord progressions in {key} {scale}:
              </p>
              
              <div className="grid gap-3">
                {commonProgressions && commonProgressions.length > 0 ? commonProgressions.map((prog, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-zinc-50 rounded-md border border-zinc-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm text-zinc-900">{prog.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">Example: {prog.example}</div>
                  </motion.div>
                )) : <div className="text-sm text-zinc-700">No common progressions available.</div>}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'variations' && (
            <motion.div
              key="variations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-zinc-700">
                Try these variations of your progression:
              </p>
              
              <div className="grid gap-3">
                {variations && variations.length > 0 ? variations.map((variation, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-zinc-50 rounded-md border border-zinc-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm text-zinc-900">{variation.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{variation.description}</div>
                    <div className="text-xs text-zinc-700 mt-2 p-2 bg-white rounded border border-zinc-100">
                      {variation.example}
                    </div>
                  </motion.div>
                )) : <div className="text-sm text-zinc-700">No variations available.</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressionAnalyzer;
