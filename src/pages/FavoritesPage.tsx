import { useState, useEffect, useCallback } from "react";
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
import ReportProgressionModal from "../components/ReportProgressionModal";
import { reportProgression } from "../services/reportService";

const FavoritesPage = () => {
  // State management
  const { favorites, loading, toggleFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProgressionId, setSelectedProgressionId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

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

  // Navigation handlers
  const goToNextProgression = useCallback(() => {
    if (currentIndex < favorites.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, favorites.length]);

  const goToPreviousProgression = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Selection handlers
  const handleSelectProgression = useCallback((id: string) => {
    const index = favorites.findIndex((prog) => prog.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setSelectedProgressionId(id);
      setViewMode("detail");
    }
  }, [favorites]);

  const handleBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedProgressionId(null);
  }, []);

  // Report handler
  const handleReportProgression = useCallback(async (reason: string, details: string) => {
    if (currentProgression) {
      try {
        await reportProgression(currentProgression.id, reason, details);
        setShowReportModal(false);
      } catch (error) {
        console.error('Error reporting progression:', error);
      }
    }
  }, [currentProgression]);

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49363b]"></div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12 bg-white rounded-md border border-[#877a74]/20 shadow-sm">
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
  );

  // Render list view
  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {favorites.map((progression) => (
        <div
          key={progression.id}
          className="bg-white rounded-md border border-[#877a74]/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
  );

  // Render detail view
  const renderDetailView = () => (
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
            <div className="bg-white rounded-md border border-[#877a74]/20 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 bg-[#f9f5f1]">
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-semibold text-[#49363b] mb-2">
                    {currentProgression.key} {currentProgression.scale}
                  </h3>
                  <p className="text-[#877a74] text-sm mb-4">
                    {currentProgression.mood} • {currentProgression.style}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <button
                    onClick={goToPreviousProgression}
                    disabled={currentIndex === 0}
                    className={`p-2 rounded-full ${
                      currentIndex === 0
                        ? 'text-[#877a74]/40 cursor-not-allowed'
                        : 'text-[#49363b] hover:bg-[#49363b]/10'
                    }`}
                  >
                    <ArrowLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(currentProgression)}
                    className="p-2 rounded-full text-[#49363b] hover:bg-[#49363b]/10"
                  >
                    <HeartIconSolid className="h-6 w-6 text-[#49363b]" />
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-full text-[#877a74] hover:text-[#49363b] hover:bg-[#49363b]/10"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextProgression}
                    disabled={currentIndex === favorites.length - 1}
                    className={`p-2 rounded-full ${
                      currentIndex === favorites.length - 1
                        ? 'text-[#877a74]/40 cursor-not-allowed'
                        : 'text-[#49363b] hover:bg-[#49363b]/10'
                    }`}
                  >
                    <ArrowRightIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Player controls */}
                <div className="flex justify-center mb-6">
                  <ProgressionPlayer 
                    chords={currentProgression.chords.map(c => 
                      typeof c === 'string' ? { name: c, notation: c } : c
                    )} 
                    tempo={90}
                  />
                </div>
              </div>
              
              {/* Progression insights */}
              <div className="p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-[#49363b] mb-4">Insights</h4>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-8 p-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#49363b] mb-4 tracking-tight">
            Your Favorites
          </h1>
          <p className="text-lg text-[#877a74] max-w-2xl mx-auto">
            Your collection of saved chord progressions for quick access.
          </p>
        </div>

        {/* Content section */}
        {loading ? renderLoadingState() : 
         favorites.length === 0 ? renderEmptyState() : 
         viewMode === "list" ? renderListView() : renderDetailView()}
        
        {/* Report modal */}
        {showReportModal && currentProgression && (
          <ReportProgressionModal
            isOpen={true}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportProgression}
            progressionId={currentProgression.id}
          />
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
