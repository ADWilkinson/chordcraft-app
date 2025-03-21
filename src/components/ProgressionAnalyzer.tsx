import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Chord } from '../types';

interface ProgressionAnalyzerProps {
  chords: { name: string }[];
  keyName: string;
  scale: string;
  insights: string[];
}

// No unused type declarations

const ProgressionAnalyzer = ({ chords, keyName, scale, insights }: ProgressionAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'variations'>('summary');

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
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {/* AI insights */}
              {insights && insights.length > 0 && (
                <div className="p-2 bg-[#f9f5f1] rounded border border-[#877a74]/20">
                  <h4 className="text-xs font-semibold text-[#49363b] mb-1">AI Insights</h4>
                  <ul className="space-y-1">
                    {insights.map((insight, index) => (
                      <li key={index} className="text-xs text-[#877a74] flex items-start">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#877a74] mt-1.5 mr-1.5 flex-shrink-0"></span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Automatic analysis */}
              <div className="p-2 bg-[#f9f5f1] rounded border border-[#877a74]/20">
                <h4 className="text-xs font-semibold text-[#49363b] mb-1">Progression Analysis</h4>
                <ul className="space-y-1">
                  {analysis.map((insight, index) => (
                    <li key={index} className="text-xs text-[#877a74] flex items-start">
                      <span className="inline-block w-1 h-1 rounded-full bg-[#877a74] mt-1.5 mr-1.5 flex-shrink-0"></span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Key and scale information */}
              <div className="p-2 bg-[#f9f5f1] rounded border border-[#877a74]/20">
                <h4 className="text-xs font-semibold text-[#49363b] mb-1">Key and Scale</h4>
                <p className="text-xs text-[#877a74]">
                  This progression is in {keyName} {scale}, which {
                    scale.toLowerCase().includes('minor') 
                      ? 'typically creates a more melancholic or tense mood.' 
                      : 'typically creates a brighter, more uplifting mood.'
                  }
                </p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'variations' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {variations.map((variation, index) => (
                <div 
                  key={index}
                  className="p-2 bg-[#f9f5f1] rounded border border-[#877a74]/20"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-semibold text-[#49363b]">{variation.name}</h4>
                  </div>
                  <p className="text-xs text-[#877a74] mb-1">{variation.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {variation.chords.map((chord, chordIndex) => (
                      <span 
                        key={chordIndex}
                        className="text-xs px-1.5 py-0.5 bg-white border border-[#877a74]/20 rounded"
                      >
                        {chord.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressionAnalyzer;
