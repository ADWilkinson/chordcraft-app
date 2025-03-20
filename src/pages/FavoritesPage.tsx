import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useFavorites } from '../hooks/useFavorites';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  HeartIcon,
  MusicalNoteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui-kit/button';
import { Spinner } from '../components/ui-kit/spinner';
import ProgressionPlayer from '../components/ProgressionPlayer';
import ProgressionAnalyzer from '../components/ProgressionAnalyzer';

const FavoritesPage = () => {
  const { favorites, loading } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedProgressionId, setSelectedProgressionId] = useState<string | null>(null);

  const currentProgression = favorites[currentIndex];
  
  // Format date for display
  const formatDate = (dateString: string | Date | any) => {
    if (!dateString) return 'Unknown date';
    
    const date = dateString instanceof Date 
      ? dateString 
      : dateString && typeof dateString.toDate === 'function'
        ? new Date(dateString.toDate())
        : dateString && dateString.seconds
          ? new Date(dateString.seconds * 1000)
          : new Date(dateString);
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Adjust current index if needed when favorites change
  useEffect(() => {
    if (currentIndex >= favorites.length && favorites.length > 0) {
      setCurrentIndex(favorites.length - 1);
    } else if (favorites.length === 0) {
      setCurrentIndex(0);
    }
    
    // If we have favorites and no selected progression, default to list view
    if (favorites.length > 0 && !selectedProgressionId) {
      setViewMode('list');
    }
  }, [favorites, currentIndex, selectedProgressionId]);

  const goToNextProgression = () => {
    if (currentIndex < favorites.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPreviousProgression = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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
  
  const handleSelectProgression = (id: string) => {
    const index = favorites.findIndex(prog => prog.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setSelectedProgressionId(id);
      setViewMode('detail');
    }
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProgressionId(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            Your Favorites
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Revisit your musical inspirations and saved chord progressions
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <Spinner className="h-10 w-10 text-indigo-600 mb-4" />
              <p className="text-zinc-600 font-medium">Loading your favorites...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-10 max-w-lg mx-auto border border-zinc-200 shadow-md">
              <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-800 mb-4">No Favorites Yet</h3>
              <p className="text-zinc-600 mb-8 max-w-sm mx-auto">
                Save the chord progressions you love to build your personal collection
              </p>
              <Link to="/">
                <Button className="flex items-center justify-center py-2.5 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm mx-auto">
                  <MusicalNoteIcon className="h-5 w-5 mr-2" />
                  Discover Progressions
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((progression) => (
                <motion.div
                  key={progression.id}
                  className="bg-white rounded-lg shadow-sm border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => handleSelectProgression(progression.id)}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                    <h3 className="font-bold text-lg">
                      {progression.key} {progression.scale}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {progression.mood && (
                        <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                          {progression.mood}
                        </span>
                      )}
                      {progression.style && (
                        <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                          {progression.style}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {progression.chords.map((chord, i) => (
                        <span 
                          key={`${progression.id}-chord-${i}`}
                          className="px-2 py-1 bg-zinc-100 rounded text-sm font-medium text-zinc-800"
                        >
                          {typeof chord === 'string' ? chord : chord.name || chord.notation || ''}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100">
                      <span>
                        {progression.qualityScore ? `${progression.qualityScore}% quality` : ''}
                      </span>
                      <span>
                        {progression.favoritedAt ? formatDate(progression.favoritedAt) : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <Button
                onClick={handleBackToList}
                className="flex items-center text-zinc-600 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              
              <div className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                {currentIndex + 1} of {favorites.length}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {currentProgression && (
                <motion.div
                  key={`progression-${currentIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 bg-white rounded-lg shadow-md overflow-hidden border border-zinc-100"
                >
                  {/* Header with title and actions */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {currentProgression.key} {currentProgression.scale} Progression
                        </h2>
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
                      
                      <div>
                        <button
                          onClick={handleShareProgression}
                          className="p-2.5 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
                          aria-label="Share progression"
                        >
                          <ShareIcon className="h-6 w-6 text-white" />
                        </button>
                      </div>
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
                        onClick={goToPreviousProgression}
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
                        {currentIndex + 1} of {favorites.length}
                      </span>
                      
                      <button
                        onClick={goToNextProgression}
                        disabled={currentIndex === favorites.length - 1}
                        className={`flex items-center px-5 py-2.5 rounded-lg font-medium ${
                          currentIndex === favorites.length - 1 
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
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
