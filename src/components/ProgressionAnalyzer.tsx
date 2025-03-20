import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, LightBulbIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { playProgression, initAudio } from '../utils/audioUtils';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface ProgressionAnalyzerProps {
  chords: { name: string }[];
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
  
  // Use our custom hook for audio playback
  const { play, stop } = useAudioPlayer();
  
  // Stop playback when component unmounts or chords change
  useEffect(() => {
    return () => {
      stop();
      setPlayingVariation(null);
    };
  }, [chords, stop]);
  
  // Generate possible variations of the current progression
  const getVariations = useCallback(() => {
    // This is a placeholder for actual chord variations
    // In a real app, these would be generated based on music theory
    return [
      {
        name: 'Variation 1: Seventh Chords',
        description: 'Adds seventh notes to create a jazzier feel',
        chords: chords.map(chord => ({ 
          name: chord.name.includes('7') ? chord.name : `${chord.name}7`
        }))
      },
      {
        name: 'Variation 2: Suspended Chords',
        description: 'Replaces some chords with suspended versions for tension',
        chords: chords.map((chord, i) => ({
          name: i % 2 === 0 ? chord.name : `${chord.name.split('/')[0]}sus4${chord.name.includes('/') ? '/' + chord.name.split('/')[1] : ''}`
        }))
      },
      {
        name: 'Variation 3: Inversions',
        description: 'Uses chord inversions for smoother voice leading',
        chords: chords.map((chord, i) => {
          const baseName = chord.name.split('/')[0];
          // Simple algorithm to create inversions
          if (i % 3 === 1 && !chord.name.includes('/')) {
            return { name: `${baseName}/3` };
          } else if (i % 3 === 2 && !chord.name.includes('/')) {
            return { name: `${baseName}/5` };
          }
          return { name: chord.name };
        })
      }
    ];
  }, [chords]);
  
  const variations = getVariations();
  
  // Play a variation
  const handlePlayVariation = useCallback((variationIndex: number) => {
    // If the same variation is currently playing, stop it
    if (playingVariation === variationIndex) {
      stop();
      setPlayingVariation(null);
      return;
    }
    
    // Get the variation chords
    const variationChords = getVariations()[variationIndex].chords;
    
    // Set the playing state before starting playback
    setPlayingVariation(variationIndex);
    
    // Play the variation chords
    play(
      variationChords,
      100, // Fixed tempo for variations
    );
    
    // Set a timeout to update UI in case playback ends
    setTimeout(() => {
      // This makes sure the UI updates when playback ends
      if (!document.querySelector('audio')?.currentTime) {
        setPlayingVariation(null);
      }
    }, variationChords.length * 2000); // Rough estimate based on chord count
    
  }, [getVariations, play, playingVariation, stop]);
  
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
      const uniqueChords = new Set(chords.map(chord => chord.name)).size;
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
        <AnimatePresence mode="wait" key="analyzer-tabs">
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
                          onClick={() => handlePlayVariation(index)}
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
                      {variation.chords.map(chord => chord.name).join(' - ')}
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
