import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useFavorites } from "../hooks/useFavorites";
import {
  HeartIcon,
  MusicalNoteIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import ProgressionPlayer from "../components/ProgressionPlayer";
import ProgressionAnalyzer from "../components/ProgressionAnalyzer";

const FavoritesPage = () => {
  const { favorites, loading } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProgressionId, setSelectedProgressionId] = useState<string | null>(null);

  const currentProgression = favorites[currentIndex];

  // Adjust current index if needed when favorites change
  useEffect(() => {
    if (currentIndex >= favorites.length && favorites.length > 0) {
      setCurrentIndex(favorites.length - 1);
    } else if (favorites.length === 0) {
      setCurrentIndex(0);
    }

    // If we have favorites and no selected progression, default to list view
    if (favorites.length > 0 && !selectedProgressionId) {
      setViewMode("list");
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

  const handleSelectProgression = (id: string) => {
    const index = favorites.findIndex((prog) => prog.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setSelectedProgressionId(id);
      setViewMode("detail");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProgressionId(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-8 p-8 bg-[#e5d8ce]/30 rounded-lg border border-[#877a74]/20 shadow-sm">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#49363b] mb-4 tracking-tight">
            Your Favorites
          </h1>
          <p className="text-lg text-[#877a74] max-w-2xl mx-auto">
            Your collection of saved chord progressions for quick access.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49363b]"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-[#877a74]/20 shadow-sm">
            <HeartIcon className="h-12 w-12 text-[#877a74] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#49363b] mb-2">No favorites yet</h3>
            <p className="text-[#877a74] mb-4">Find progressions you like and save them to your favorites.</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-[#49363b] text-white rounded-md hover:bg-[#49363b]/80 transition-colors"
            >
              Discover Progressions
            </Link>
          </div>
        ) : viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((progression) => (
              <div
                key={progression.id}
                className="bg-white rounded-lg border border-[#877a74]/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 bg-[#f9f5f1]">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-[#49363b]">
                      {progression.key} {progression.scale}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSelectProgression(progression.id)}
                        className="p-1.5 rounded-full hover:bg-[#e5d8ce]/50 transition-colors"
                        aria-label="View progression"
                      >
                        <MusicalNoteIcon className="h-5 w-5 text-[#877a74] hover:text-[#49363b]" />
                      </button>
                      <HeartIconSolid className="h-5 w-5 text-[#49363b]" />
                    </div>
                  </div>

                  {/* Tags/badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {progression.mood && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e5d8ce]/70 text-[#49363b] text-xs font-medium">
                        {progression.mood}
                      </span>
                    )}
                    {progression.style && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e5d8ce]/70 text-[#49363b] text-xs font-medium">
                        {progression.style}
                      </span>
                    )}
                  </div>

                  {/* Chord preview */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {progression.chords.map((chord, index) => (
                      <span
                        key={`${progression.id}-chord-${index}`}
                        className="inline-block px-2 py-1 bg-white border border-[#877a74]/20 rounded text-sm text-[#49363b] font-medium"
                      >
                        {typeof chord === "string" ? chord : chord.name || chord.notation || ""}
                      </span>
                    ))}
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => handleSelectProgression(progression.id)}
                    className="w-full mt-2 py-2 bg-[#49363b] hover:bg-[#49363b]/90 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <MusicalNoteIcon className="h-4 w-4 mr-2" />
                    Play Progression
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="flex items-center px-3 py-1.5 rounded text-sm font-medium bg-[#e5d8ce] text-[#49363b] hover:bg-[#d6c7bc] transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to List
              </button>

              <div className="text-sm text-[#877a74]">
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
                  className="mb-8"
                >
                  <div className="bg-white rounded-lg border border-[#877a74]/20 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 bg-[#f9f5f1]">
                      <div className="flex flex-col items-center">
                        <h3 className="text-xl font-semibold text-[#49363b] mb-2">
                          {currentProgression.key} {currentProgression.scale}
                        </h3>
                        <p className="text-[#877a74] text-sm mb-4">
                          {currentProgression.mood} • {currentProgression.style}
                        </p>
                      </div>
                      
                      {/* Favorite button */}
                      <div className="flex items-center space-x-2">
                        <HeartIconSolid className="h-6 w-6 text-[#49363b]" />
                        
                        {/* Report button */}
                        <button
                          className="p-2 rounded-full hover:bg-[#e5d8ce]/50 transition-colors"
                          aria-label="Report progression"
                        >
                          <FlagIcon className="h-5 w-5 text-[#877a74] hover:text-[#49363b]" />
                        </button>
                      </div>
                      
                      {/* AI badge if applicable */}
                      {currentProgression.isAIGenerated && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-[#e5d8ce] text-[#49363b] text-xs font-medium mb-4">
                          <MusicalNoteIcon className="h-3 w-3 mr-1" />
                          AI Generated
                        </div>
                      )}
                      
                      {/* Progression content */}
                      <div className="bg-white rounded-lg border border-[#877a74]/20 overflow-hidden">
                        
                        {/* Chords display and player - more compact layout */}
                        <div className="p-4">
                          
                          {/* Progression Player */}
                          <div className="mb-4 w-full">
                            <ProgressionPlayer
                              chords={currentProgression.chords.map(c => 
                                typeof c === 'string' ? { name: c, notation: c } : c
                              )} 
                              tempo={90}
                            />
                          </div>
                          
                          {/* Navigation controls - with new theme colors */}
                          <div className="flex justify-between items-center mt-3 mb-2">
                            <button
                              onClick={goToPreviousProgression}
                              disabled={currentIndex === 0}
                              className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                                currentIndex === 0
                                  ? 'bg-[#e5d8ce]/30 text-[#877a74]/50 cursor-not-allowed'
                                  : 'bg-[#e5d8ce] text-[#49363b] hover:bg-[#d6c7bc] transition-colors'
                              }`}
                            >
                              <ArrowLeftIcon className="h-4 w-4 mr-1" />
                              Previous
                            </button>
                            
                            <span className="text-sm text-[#877a74]">
                              {currentIndex + 1} of {favorites.length}
                            </span>
                            
                            <button
                              onClick={goToNextProgression}
                              disabled={currentIndex === favorites.length - 1}
                              className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                                currentIndex === favorites.length - 1
                                  ? 'bg-[#e5d8ce]/30 text-[#877a74]/50 cursor-not-allowed'
                                  : 'bg-[#e5d8ce] text-[#49363b] hover:bg-[#d6c7bc] transition-colors'
                              }`}
                            >
                              Next
                              <ArrowRightIcon className="h-4 w-4 ml-1" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progression analyzer */}
                        <div className="border-t border-[#877a74]/20 p-4">
                          <h3 className="text-lg font-semibold text-[#49363b] mb-3">Analysis</h3>
                          <ProgressionAnalyzer
                            chords={currentProgression.chords.map(c => 
                              typeof c === 'string' ? { name: c } : { name: c.name || c.notation || '' }
                            )}
                            keyName={currentProgression.key}
                            scale={currentProgression.scale}
                            insights={currentProgression.insights || []}
                          />
                        </div>
                      </div>
                    </div>
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
