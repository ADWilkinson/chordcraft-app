import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import GeneratorForm from '../components/GeneratorForm';
import { ChordProgression, GenerationParams } from '../types';
import { fetchRandomProgression, requestChordProgression } from '../services/progressionService';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui-kit/button';
import ProgressionPlayer from '../components/ProgressionPlayer';
import ProgressionAnalyzer from '../components/ProgressionAnalyzer';
import ReportProgressionModal from '../components/ReportProgressionModal';
import { reportProgression } from '../services/reportService';
import { useFavorites } from '../hooks/useFavorites';

const HomePage = () => {
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Use the favorites hook instead of managing favorites directly
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentProgression = progressions[currentIndex];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setIsNewlyGenerated(false);
    setHasSearched(true);
    setNoResultsFound(false);
    try {
      const fetchedProgression = await fetchRandomProgression();
      if (fetchedProgression) {
        const newProgressions = [...progressions, fetchedProgression];
        setProgressions(newProgressions);
        setCurrentIndex(newProgressions.length - 1); // Set to the new progression
        setFetchCount(prev => prev + 1);
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error fetching progression:', err);
      setError('Failed to fetch chord progression. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async (params: GenerationParams) => {
    setError(null);
    setLoading(true);
    setGeneratingWithAI(true);
    setHasSearched(true);
    setIsNewlyGenerated(false);
    setNoResultsFound(false);
    try {
      // Generate a new progression with AI
      const newProgression = await requestChordProgression(params);
      
      if (newProgression) {
        // Add the new progression to the list
        const newProgressions = [...progressions, newProgression];
        setProgressions(newProgressions);
        setCurrentIndex(newProgressions.length - 1); // Set to the new progression
        setShowForm(false);
        setIsNewlyGenerated(true);
        
        // Show a success toast
      } else {
        throw new Error('Failed to generate a new chord progression');
      }
    } catch (err) {
      console.error('Error generating with AI:', err);
      setError('Failed to generate chord progression. Please try again.');
      
      // Show an error toast
    } finally {
      setGeneratingWithAI(false);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < progressions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleShareProgression = async () => {
    if (currentProgression) {
      try {
        // Create a shareable text representation of the progression
        const chordNames = currentProgression.chords.map(chord => 
          typeof chord === 'string' ? chord : chord.name || chord.notation || ''
        );
        const chords = chordNames.join(' - ');
        const shareText = `Check out this ${currentProgression.mood} ${currentProgression.style} chord progression in ${currentProgression.key} ${currentProgression.scale}: ${chords} #ChordCraft`;
        
        // Use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: 'ChordCraft Progression',
            text: shareText,
            url: window.location.href,
          });
        } else {
          // Fallback: Copy to clipboard
          await navigator.clipboard.writeText(shareText);
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleReportProgression = async (reason: string, details: string) => {
    if (currentProgression) {
      try {
        await reportProgression(currentProgression.id, reason, details);
        return Promise.resolve();
      } catch (error) {
        console.error('Error reporting progression:', error);
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error('No progression selected'));
  };

  // Convert the ChordProgressionType to the format expected by the ChordProgression component
  const formatProgressionForComponent = (progression: ChordProgression) => {
    if (!progression) return null;
    
    // Convert any string chords to Chord objects
    const formattedChords = progression.chords.map(chord => {
      if (typeof chord === 'string') {
        return {
          name: chord,
          notes: [chord], // Placeholder, would need actual notes
        };
      }
      return {
        name: chord.name,
        notes: [chord.notation || chord.name], // Using notation as notes
        function: chord.function
      };
    });
    
    // Check if the first chord is minor but key is major (inconsistency)
    let key = progression.key;
    let scale = progression.scale;
    
    // If the first chord is minor (ends with 'm') but scale is major, adjust the scale
    const firstChord = typeof progression.chords[0] === 'string' 
      ? progression.chords[0] 
      : progression.chords[0]?.name || '';
      
    // Check for inconsistency between first chord and key/scale
    if (firstChord.endsWith('m') && !firstChord.includes('maj') && scale.toLowerCase() === 'major') {
      // If the first chord is minor but scale is major, we should adjust
      scale = 'minor';
    }
    
    // Return a component-compatible progression object
    return {
      id: progression.id,
      key: key,
      scale: scale,
      chords: formattedChords,
      mood: progression.mood,
      style: progression.style,
      insights: progression.insights,
      createdAt: progression.createdAt,
      likes: progression.likes || 0,
      flags: progression.flags || 0
    };
  };

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              key="generator-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <GeneratorForm 
                onSearch={handleSearch}
                onGenerateWithAI={handleGenerateWithAI}
                loading={loading}
                noResultsFound={noResultsFound}
                fetchCount={fetchCount}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progression display and controls */}
        {error && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <div className="font-medium">Error</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </motion.div>
        )}
        
        {progressions.length > 0 && currentProgression && (
          <motion.div 
            className="mt-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatProgressionForComponent(currentProgression) && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`progression-${currentProgression.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Progression header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6 text-white">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold flex items-center tracking-tight">
                          {currentProgression.key} {currentProgression.scale}
                          {currentProgression.isAIGenerated && (
                            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-300 text-purple-900">
                              <SparklesIcon className="h-3.5 w-3.5 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </h2>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => toggleFavorite(currentProgression)}
                            className="p-2.5 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
                            aria-label={isFavorite(currentProgression.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite(currentProgression.id) ? (
                              <BookmarkIcon className="h-6 w-6 text-pink-300" />
                            ) : (
                              <BookmarkIcon className="h-6 w-6 text-white" />
                            )}
                          </button>
                          <button
                            onClick={handleShareProgression}
                            className="p-2.5 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
                            aria-label="Share progression"
                          >
                            <ShareIcon className="h-6 w-6 text-white" />
                          </button>
                          <button
                            onClick={() => setShowReportModal(true)}
                            className="p-2.5 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
                            aria-label="Report progression"
                          >
                            <FlagIcon className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {currentProgression.mood && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-400/30 text-indigo-50">
                            {currentProgression.mood}
                          </span>
                        )}
                        {currentProgression.style && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-400/30 text-indigo-50">
                            {currentProgression.style}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Chords display */}
                    <div className="p-8">
                      <h3 className="text-lg font-semibold text-zinc-800 mb-5">Chord Sequence</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {currentProgression.chords.map((chord, index) => (
                          <motion.div
                            key={`chord-${index}`}
                            className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col items-center justify-center"
                            whileHover={{ y: -8, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <span className="text-3xl font-bold text-zinc-800 mb-1">
                              {typeof chord === 'string' ? chord : chord.name || chord.notation || ''}
                            </span>
                            <span className="text-xs font-medium text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full">
                              Position {index + 1}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Progression Player */}
                      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200 p-6 mb-8 shadow-sm">
                        <ProgressionPlayer 
                          chords={currentProgression.chords.map(c => 
                            typeof c === 'string' ? { name: c } : c
                          )} 
                          tempo={90}
                        />
                      </div>
                      
                      {/* Quality score */}
                      {currentProgression.qualityScore && (
                        <div className="flex flex-col items-center justify-center mb-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                          <div className="text-sm font-medium text-zinc-600 mb-2">
                            Quality Score: {currentProgression.qualityScore}%
                          </div>
                          <div className="bg-zinc-200 rounded-full h-3 w-full max-w-md overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${currentProgression.qualityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Navigation controls */}
                      <div className="flex justify-between items-center mt-8">
                        <button
                          onClick={handlePrevious}
                          disabled={currentIndex === 0}
                          className={`flex items-center px-5 py-2.5 rounded-lg font-medium ${
                            currentIndex === 0 
                              ? 'text-zinc-400 bg-zinc-100 cursor-not-allowed' 
                              : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300'
                          } transition-colors`}
                        >
                          <ArrowLeftIcon className="h-4 w-4 mr-2" />
                          Previous
                        </button>
                        
                        <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                          {currentIndex + 1} of {progressions.length}
                        </span>
                        
                        <button
                          onClick={handleNext}
                          disabled={currentIndex === progressions.length - 1}
                          className={`flex items-center px-5 py-2.5 rounded-lg font-medium ${
                            currentIndex === progressions.length - 1 
                              ? 'text-zinc-400 bg-zinc-100 cursor-not-allowed' 
                              : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300'
                          } transition-colors`}
                        >
                          Next
                          <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Insights section */}
                    <div className="border-t border-zinc-200 p-8 bg-zinc-50">
                      <button 
                        className="flex items-center justify-center w-full text-zinc-600 hover:text-zinc-800 transition-colors"
                        onClick={() => setShowInsights(!showInsights)}
                      >
                        {showInsights ? (
                          <>
                            <ChevronUpIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">Hide music theory insights</span>
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">Show music theory insights</span>
                          </>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {showInsights && (
                          <motion.div
                            key="insights"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden mt-4"
                          >
                            <ProgressionAnalyzer 
                              chords={currentProgression.chords.map(c => ({ name: String(c) }))}
                              keyName={currentProgression.key}
                              scale={currentProgression.scale}
                              insights={currentProgression.insights || []}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Only show "Just generated" message when a progression is actually generated on the fly */}
                {isNewlyGenerated && (
                  <motion.div 
                    className="mt-4 mb-8 flex items-center justify-center py-3 px-6 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 rounded-xl border border-indigo-100 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="font-medium">Just generated, thank you for contributing to ChordCraft</span>
                  </motion.div>
                )}
              </>
            )}
          
          </motion.div>
        )}
        
        {(loading || generatingWithAI) && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="h-12 w-12 border-4 border-zinc-400 border-t-zinc-200 rounded-full animate-spin"></div>
            {generatingWithAI ? (
              <p className="text-gray-600 animate-pulse flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Creating magic with AI...
              </p>
            ) : (
              <p className="text-gray-600 animate-pulse flex items-center">
                Searching database...
              </p>
            )}
          </div>
        )}
        
        {!loading && !generatingWithAI && noResultsFound && hasSearched && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-zinc-50 rounded-md p-8 max-w-lg mx-auto border border-zinc-200">
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">No Progressions Found</h3>
              <p className="text-zinc-600 mb-6">
                Try different parameters or let AI create something new
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={toggleForm}
                  className="flex items-center justify-center py-2 px-4 bg-zinc-800 text-white rounded-md hover:bg-black transition-colors"
                >
                  Modify Search
                </Button>
                <Button
                  onClick={() => {
                    if (showForm) {
                      // If form is already showing, just trigger AI generation
                      handleGenerateWithAI({
                        key: '',
                        scale: '',
                        startingChord: '',
                        mood: '',
                        style: ''
                      });
                    } else {
                      // Show form and set noResultsFound to highlight AI generation option
                      setShowForm(true);
                    }
                  }}
                  className="flex items-center justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {showReportModal && currentProgression && (
        <ReportProgressionModal 
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportProgression}
          progressionId={currentProgression.id}
        />
      )}
    </Layout>
  );
};

export default HomePage;
