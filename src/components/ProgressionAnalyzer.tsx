import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, LightBulbIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Chord } from '../types';
import { playProgression, stopAllAudio, initAudio } from '../utils/audioUtils';

interface ProgressionAnalyzerProps {
  chords: { name: string }[];
  keyName: string;
  scale: string;
  insights: string[];
}

// No unused type declarations

const ProgressionAnalyzer = ({ chords, keyName, scale, insights }: ProgressionAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'variations'>('summary');
  const [playingVariation, setPlayingVariation] = useState<number | null>(null);
  
  // Audio playback state and functions
  const [playbackController, setPlaybackController] = useState<{ stop: () => void; isPlaying: () => boolean } | null>(null);
  
  // Function to play chords
  const play = useCallback(async (chordsToPlay: Chord[], tempoValue: number) => {
    try {
      await initAudio();
      const controller = playProgression(
        chordsToPlay,
        tempoValue
      );
      setPlaybackController(controller);
    } catch (error) {
      console.error('Error playing chords:', error);
    }
  }, []);
  
  // Function to stop playback
  const stop = useCallback(() => {
    if (playbackController) {
      playbackController.stop();
      setPlaybackController(null);
    }
    stopAllAudio();
  }, [playbackController]);
  
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
          name: chord.name.includes('7') ? chord.name : `${chord.name}7`,
          notation: chord.name.includes('7') ? chord.name : `${chord.name}7`
        })) as Chord[]
      },
      {
        name: 'Variation 2: Suspended Chords',
        description: 'Replaces some chords with suspended versions for tension',
        chords: chords.map((chord, i) => {
          const chordName = i % 2 === 0 
            ? chord.name 
            : `${chord.name.split('/')[0]}sus4${chord.name.includes('/') ? '/' + chord.name.split('/')[1] : ''}`;
          return {
            name: chordName,
            notation: chordName
          };
        }) as Chord[]
      },
      {
        name: 'Variation 3: Inversions',
        description: 'Uses chord inversions for smoother voice leading',
        chords: chords.map((chord, i) => {
          const baseName = chord.name.split('/')[0];
          let chordName = chord.name;
          
          // Simple algorithm to create inversions
          if (i % 3 === 1 && !chord.name.includes('/')) {
            chordName = `${baseName}/3`;
          } else if (i % 3 === 2 && !chord.name.includes('/')) {
            chordName = `${baseName}/5`;
          }
          
          return { 
            name: chordName, 
            notation: chordName 
          };
        }) as Chord[]
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
      setPlayingVariation(null);
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
    <div className="bg-white rounded-sm border border-[#877a74]/30 overflow-hidden">
      {/* Segmented tab buttons */}
      <div className="px-1.5 py-1.5 flex space-x-1 bg-[#e5d8ce]/50">
        <button
          className={`flex-1 flex justify-center items-center px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            activeTab === 'summary' 
              ? 'bg-[#49363b] text-[#e5d8ce] shadow-sm' 
              : 'bg-white text-[#49363b] hover:bg-[#e5d8ce] border border-[#877a74]/30'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          <ChartBarIcon className="h-3 w-3 mr-1" />
          Analysis
        </button>
        <button
          className={`flex-1 flex justify-center items-center px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            activeTab === 'variations' 
              ? 'bg-[#49363b] text-[#e5d8ce] shadow-sm' 
              : 'bg-white text-[#49363b] hover:bg-[#e5d8ce] border border-[#877a74]/30'
          }`}
          onClick={() => setActiveTab('variations')}
        >
          <LightBulbIcon className="h-3 w-3 mr-1" />
          Variations
        </button>
      </div>
      
      {/* Content */}
      <div className="p-2">
        <AnimatePresence mode="wait" key="analyzer-tabs">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-2">
                {/* Key and scale chip */}
                <div className="inline-flex items-center bg-[#e5d8ce] px-2 py-1 rounded-full border border-[#877a74]/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#49363b] mr-1.5"></div>
                  <p className="text-[10px] font-medium text-[#241c1c]">
                    {keyName && scale ? `${keyName} ${scale.replace('_', ' ')}` : 'Unknown key/scale'}
                  </p>
                </div>
                
                {/* Analysis and Insights in a clean card */}
                <div className="bg-gradient-to-r from-[#e5d8ce]/80 to-[#e5d8ce]/40 rounded border border-[#877a74]/30 overflow-hidden shadow-sm">
                  {/* Tabs for analysis sections */}
                  <div className="flex border-b border-[#877a74]/20 text-[10px] font-medium">
                    <div className="flex-1 flex items-center justify-center py-1 px-1 bg-white text-[#49363b]">
                      Analysis
                    </div>
                    <div className="flex-1 flex items-center justify-center py-1 px-1 text-[#877a74]">
                      Insights
                    </div>
                  </div>
                  
                  {/* Analysis content */}
                  <div className="p-2">
                    <ul className="space-y-1 text-[10px] text-[#241c1c]">
                      {analysis.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#877a74]/40 mt-1 mr-1.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Insights header */}
                  <div className="px-2 pt-1 pb-0.5 border-t border-[#877a74]/20">
                    <h5 className="text-[10px] font-semibold text-[#49363b] uppercase tracking-wider">Key Insights</h5>
                  </div>
                  
                  {/* Insights content */}
                  <div className="px-2 pb-2">
                    <ul className="space-y-1.5 text-[10px] text-[#241c1c]">
                      {insights && insights.length > 0 ? (
                        insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#49363b]/70 mt-1 mr-1.5 flex-shrink-0"></span>
                            <span>{insight}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-[#877a74]">No insights available</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'variations' && (
            <motion.div
              key="variations"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-1.5">
                {variations.map((variation, index) => (
                  <div 
                    key={index}
                    className={`p-1.5 rounded border ${
                      playingVariation === index 
                        ? 'border-[#49363b]/50 bg-[#e5d8ce]' 
                        : 'border-[#877a74]/30 bg-white hover:border-[#877a74]'
                    } transition-colors shadow-sm`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-medium text-[#241c1c]">{variation.name}</h3>
                      {variation.chords && variation.chords.length > 0 && (
                        <button 
                          onClick={() => handlePlayVariation(index)}
                          className={`p-1 rounded-full ${
                            playingVariation === index 
                              ? 'bg-[#49363b] text-white' 
                              : 'bg-[#e5d8ce] text-[#49363b] hover:bg-[#877a74]/30'
                          } transition-colors`}
                          aria-label={playingVariation === index ? 'Stop playing' : 'Play variation'}
                        >
                          {playingVariation === index ? (
                            <PauseIcon className="h-2.5 w-2.5" />
                          ) : (
                            <PlayIcon className="h-2.5 w-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-[#877a74] text-[10px] mt-0.5">{variation.description}</p>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {variation.chords.map((chord, idx) => (
                        <span key={idx} className="inline-block text-[10px] px-1.5 py-0.5 bg-[#e5d8ce]/50 border border-[#877a74]/20 rounded text-[#241c1c] font-mono">
                          {chord.name}
                        </span>
                      ))}
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
