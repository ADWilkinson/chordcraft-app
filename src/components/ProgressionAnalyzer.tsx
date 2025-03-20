import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, LightBulbIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { playProgression, initAudio } from '../utils/audioUtils';

interface ProgressionAnalyzerProps {
  chords: string[];
  keyName: string;
  scale: string;
  insights: string[];
}

interface ProgressionPlayerRef {
  stop: () => void;
  isPlaying: () => boolean;
}

const ProgressionAnalyzer = ({ chords, keyName, scale, insights }: ProgressionAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'variations'>('summary');
  const [playingVariation, setPlayingVariation] = useState<number | null>(null);
  const [progressionPlayer, setProgressionPlayer] = useState<ProgressionPlayerRef | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initAudio();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initializeAudio();
    
    // Cleanup on unmount
    return () => {
      stopPlayback();
    };
  }, []);
  
  // Stop playback when component unmounts or chords change
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [chords]);
  
  const stopPlayback = useCallback(() => {
    if (progressionPlayer) {
      progressionPlayer.stop();
      setProgressionPlayer(null);
    }
    setPlayingVariation(null);
  }, [progressionPlayer]);
  
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
          example: 'N/A',
          chords: []
        }
      ];
    }
    
    return [
      {
        name: 'Add 7th chords',
        description: 'Add 7ths to some or all chords for a jazzier sound',
        example: chords.map(chord => 
          chord.includes('m') ? `${chord}7` : `${chord}maj7`
        ).join(' - '),
        chords: chords.map(chord => chord.includes('m') ? `${chord}7` : `${chord}maj7`)
      },
      {
        name: 'Substitute dominant chords',
        description: 'Replace V with V7 or VII7 for more tension',
        example: chords.join(' - ').replace(getRelativeChord(keyName || 'C', 5), `${getRelativeChord(keyName || 'C', 5)}7`),
        chords: chords.map(chord => 
          chord === getRelativeChord(keyName || 'C', 5) ? `${chord}7` : chord
        )
      },
      {
        name: 'Add passing chords',
        description: 'Insert passing chords between existing chords',
        example: chords.length > 1 ? 
          `${chords[0]} - ${getRelativeChord(keyName || 'C', 3)}m - ${chords[1]} - ${chords.slice(2).join(' - ')}` :
          `${chords[0]} - ${getRelativeChord(keyName || 'C', 3)}m`,
        chords: chords.length > 1 ? 
          [chords[0], `${getRelativeChord(keyName || 'C', 3)}m`, ...chords.slice(1)] :
          [chords[0], `${getRelativeChord(keyName || 'C', 3)}m`]
      },
      {
        name: 'Borrowed chords',
        description: 'Borrow chords from the parallel minor/major key',
        example: chords.join(' - ').replace(
          getRelativeChord(keyName || 'C', 4), 
          (scale || '').toLowerCase().includes('minor') ? getRelativeChord(keyName || 'C', 4) : `${getRelativeChord(keyName || 'C', 4)}m`
        ),
        chords: chords.map(chord => 
          chord === getRelativeChord(keyName || 'C', 4) ? 
            (scale || '').toLowerCase().includes('minor') ? 
              getRelativeChord(keyName || 'C', 4) : `${getRelativeChord(keyName || 'C', 4)}m` 
            : chord
        )
      }
    ];
  };
  
  const variations = getVariations();
  
  // Play a variation
  const playVariation = async (index: number) => {
    // If already playing any variation, stop it completely
    if (playingVariation !== null) {
      stopPlayback();
      // If clicking the same variation that was playing, just stop and don't restart
      if (playingVariation === index) {
        return;
      }
    }
    
    // Start new playback
    try {
      await initAudio();
      
      const variationChords = variations[index].chords;
      if (variationChords.length === 0) return;
      
      setPlayingVariation(index);
      
      const player = playProgression(
        variationChords,
        80, // tempo
        undefined, // no chord change callback needed
        () => {
          // Reset when playback completes
          setPlayingVariation(null);
          setProgressionPlayer(null);
        }
      );
      
      setProgressionPlayer(player);
      
      // Double-check playback state after a short delay
      setTimeout(() => {
        if (player && !player.isPlaying()) {
          setPlayingVariation(null);
          setProgressionPlayer(null);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to play variation:', error);
      setPlayingVariation(null);
    }
  };
  
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
    
    return [lengthAnalysis, repetitionAnalysis];
  };
  
  const analysis = analyzeProgression();
  
  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      <div className="border-b border-zinc-100">
        <div className="flex">
          <button
            className={`px-4 py-3 flex items-center space-x-2 ${
              activeTab === 'summary' 
                ? 'border-b-2 border-zinc-500 text-zinc-800' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Analysis</span>
          </button>
          <button
            className={`px-4 py-3 flex items-center space-x-2 ${
              activeTab === 'variations' 
                ? 'border-b-2 border-zinc-500 text-zinc-800' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            onClick={() => setActiveTab('variations')}
          >
            <LightBulbIcon className="h-5 w-5" />
            <span>Variations</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Key and Scale</h3>
                  <p className="text-zinc-600 mt-1">
                    {keyName && scale ? `${keyName} ${scale.replace('_', ' ')}` : 'Unknown key/scale'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Progression Analysis</h3>
                  <ul className="mt-2 space-y-2 text-zinc-600">
                    {analysis.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Insights</h3>
                  <ul className="mt-2 space-y-2 text-zinc-600">
                    {insights && insights.length > 0 ? (
                      insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-zinc-500 mr-2">•</span>
                          <span>{insight}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-500">No insights available</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'variations' && (
            <motion.div
              key="variations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      playingVariation === index 
                        ? 'border-zinc-400 bg-zinc-100' 
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30'
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-zinc-900">{variation.name}</h3>
                      {variation.chords && variation.chords.length > 0 && (
                        <button 
                          onClick={() => playVariation(index)}
                          className={`p-1.5 rounded-full ${
                            playingVariation === index 
                              ? 'bg-zinc-700 text-white' 
                              : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                          } transition-colors`}
                          aria-label={playingVariation === index ? 'Stop playing' : 'Play variation'}
                        >
                          {playingVariation === index ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-600 text-sm mt-1">{variation.description}</p>
                    <div className="mt-2 text-sm font-mono bg-zinc-50 p-2 rounded border border-zinc-200 text-zinc-700">
                      {variation.example}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressionAnalyzer;
