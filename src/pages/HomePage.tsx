import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import GeneratorForm from '../components/GeneratorForm';
import ChordProgression from '../components/ChordProgression';
// import FeatureSuggestion from '../components/FeatureSuggestion';
import { fetchProgressions, requestChordProgression, checkProgressionsExist } from '../services/progressionService';
import { GenerationParams, ChordProgression as ChordProgressionType } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui-kit/button';
import { Spinner } from '../components/ui-kit/spinner';

const HomePage = () => {
  const [progressions, setProgressions] = useState<ChordProgressionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // const [showSuggestion, setShowSuggestion] = useState(false);
  
  // Initialize favorites hook for use in the component
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const currentProgression = progressions[currentIndex];

  const handleSearch = async (params: GenerationParams) => {
    setLoading(true);
    setError(null);
    setIsNewlyGenerated(false);
    setHasSearched(true);
    try {
      const fetchedProgressions = await fetchProgressions(params);
      setProgressions(fetchedProgressions);
      setCurrentIndex(0);
      setShowForm(false);
    } catch (err) {
      console.error('Error fetching progressions:', err);
      setError('Failed to fetch chord progressions. Please try again.');
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
    try {
      // First check if there are existing progressions with these parameters
      const existingProgressions = await checkProgressionsExist(params);
      
      if (existingProgressions) {
        // If progressions exist, fetch them from the database
        await handleSearch(params);
      } else {
        // If no progressions exist, generate a new one with AI on the fly
        const newProgression = await requestChordProgression(params);
        
        if (newProgression) {
          // Add the new progression to the list
          setProgressions([newProgression]);
          setCurrentIndex(0);
          setShowForm(false);
          setIsNewlyGenerated(true);
        } else {
          throw new Error('Failed to generate a new chord progression');
        }
      }
    } catch (err) {
      console.error('Error generating with AI:', err);
      setError('Failed to generate chord progression. Please try again.');
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

  const handleSaveProgression = () => {
    if (currentProgression) {
      // Save the current progression to favorites
      addFavorite(formatProgressionForComponent(currentProgression)!);
      alert("Progression saved to favorites!");
    }
  };

  const handleShareProgression = async () => {
    if (currentProgression) {
      try {
        // Create a shareable text representation of the progression
        const chords = currentProgression.chords.join(' - ');
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
          alert("Progression copied to clipboard. You can now paste and share!");
        }
      } catch (error) {
        console.error('Error sharing:', error);
        alert("Unable to share this progression. Please try again.");
      }
    }
  };

  // Convert the ChordProgressionType to the format expected by the ChordProgression component
  const formatProgressionForComponent = (progression: ChordProgressionType) => {
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
      createdAt: progression.createdAt instanceof Date 
        ? progression.createdAt 
        : progression.createdAt && typeof progression.createdAt.toDate === 'function'
          ? new Date(progression.createdAt.toDate())
          : progression.createdAt && progression.createdAt.seconds
            ? new Date(progression.createdAt.seconds * 1000)
            : new Date(),
      likes: progression.likes || 0,
      flags: progression.flags || 0
    } as any; // Use type assertion to bypass type checking
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            Craft Your Sound
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Discover perfect chord progressions with AI
          </p>
        </motion.div>

        <AnimatePresence>
          {/* {showSuggestion && (
            <FeatureSuggestion 
              onDismiss={() => setShowSuggestion(false)}
              onSubmit={(suggestion) => {
                console.log('Feature suggestion:', suggestion);
                // TODO: Send suggestion to backend
              }}
            />
          )} */}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <GeneratorForm 
                onGenerateWithAI={handleGenerateWithAI}
                loading={loading || generatingWithAI}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {error && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {progressions.length > 0 && currentProgression && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatProgressionForComponent(currentProgression) && (
              <>
                <ChordProgression 
                  progression={formatProgressionForComponent(currentProgression)!} 
                  key={currentProgression.id}
                  onFavoriteToggle={() => {
                    // Toggle favorite status for the current progression
                    if (isFavorite(currentProgression.id)) {
                      removeFavorite(currentProgression.id);
                    } else {
                      addFavorite(formatProgressionForComponent(currentProgression)!);
                    }
                  }}
                />
                {/* Only show "Just generated" message when a progression is actually generated on the fly */}
                {isNewlyGenerated && (
                  <motion.div 
                    className="mt-3 mb-12 flex items-center justify-center py-2 px-4 bg-zinc-100 text-zinc-800 rounded-md border border-zinc-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SparklesIcon className="h-5 w-5 mr-2 text-zinc-700" />
                    <span className="font-medium">Just generated, thank you for contributing to ChordCraft</span>
                  </motion.div>
                )}
              </>
            )}
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`flex items-center justify-center p-2 rounded-md ${
                    currentIndex === 0
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                  } transition-colors`}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                
                <div className="text-zinc-600 text-sm">
                  {currentIndex + 1} of {progressions.length}
                </div>
                
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === progressions.length - 1}
                  className={`flex items-center justify-center p-2 rounded-md ${
                    currentIndex === progressions.length - 1
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                  } transition-colors`}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSaveProgression}
                className="flex items-center justify-center py-2 px-4 bg-zinc-800 text-white rounded-md hover:bg-black transition-colors"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button
                onClick={handleShareProgression}
                className="flex items-center justify-center py-2 px-4 bg-zinc-200 text-zinc-800 rounded-md hover:bg-zinc-300 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
        
        {!loading && !generatingWithAI && progressions.length === 0 && hasSearched && (
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
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Modify Search
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {(loading || generatingWithAI) && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <Spinner className="h-12 w-12" />
            {generatingWithAI && (
              <p className="text-gray-600 animate-pulse flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Creating magic...
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
