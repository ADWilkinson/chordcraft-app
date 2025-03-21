import { useState, useCallback } from "react";
import {
  HeartIcon,
  MusicalNoteIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

import Layout from "../components/Layout";
import GeneratorForm from "../components/GeneratorForm";
import ProgressionPlayer from "../components/ProgressionPlayer";
import ProgressionAnalyzer from "../components/ProgressionAnalyzer";
import ReportProgressionModal from "../components/ReportProgressionModal";
import { ChordProgression } from "../types";
import { fetchRandomProgression, requestChordProgression } from "../services/progressionService";
import { useFavorites } from "../hooks/useFavorites";
import { reportProgression } from "../services/reportService";

const HomePage = () => {
  // State management
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Use the favorites hook
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentProgression = progressions[currentIndex];

  // Handler for fetching random progressions
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const fetchedProgression = await fetchRandomProgression();
      setFetchCount(prev => prev + 1);
      
      if (fetchedProgression) {
        setProgressions(prev => {
          // If this is the first progression or we want to start fresh
          if (prev.length === 0) {
            return [fetchedProgression];
          }
          // Otherwise add to existing progressions
          const updatedProgressions = [...prev, fetchedProgression];
          // Update the current index to point to the new progression
          setTimeout(() => {
            setCurrentIndex(updatedProgressions.length - 1);
          }, 0);
          return updatedProgressions;
        });
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error fetching progression:', err);
      setNoResultsFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handler for generating progressions with AI
  const handleGenerateWithAI = useCallback(async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const newProgression = await requestChordProgression({});
      
      if (newProgression) {
        setProgressions(prev => {
          const updatedProgressions = [...prev, newProgression];
          // We need to set the current index after the state has been updated
          setTimeout(() => {
            setCurrentIndex(updatedProgressions.length - 1);
          }, 0);
          return updatedProgressions;
        });
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error generating with AI:', err);
      setNoResultsFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigation handlers
  const handlePrevProgression = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNextProgression = useCallback(() => {
    if (currentIndex < progressions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, progressions.length]);

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

  // Render no results state
  const renderNoResultsState = () => (
    <div className="text-center py-12 bg-white rounded-md border border-[#877a74]/20 shadow-sm">
      <MusicalNoteIcon className="h-12 w-12 text-[#877a74] mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#49363b] mb-2">No progressions found</h3>
      <p className="text-[#877a74] mb-4">Try generating a new progression with AI.</p>
      <button
        onClick={handleGenerateWithAI}
        className="px-4 py-2 bg-[#49363b] text-white rounded-md hover:bg-[#49363b]/80 transition-colors"
      >
        Generate with AI
      </button>
    </div>
  );

  // Render progression content
  const renderProgressionContent = () => {
    if (!currentProgression) return null;
    
    return (
      <div className="mb-8">
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
            

            
            {/* Player controls */}
            <div className="flex justify-center mb-6">
              <ProgressionPlayer chords={currentProgression.chords} />
            </div>
            
            {/* Navigation controls */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onClick={handlePrevProgression}
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
                {isFavorite(currentProgression.id) ? (
                  <HeartIconSolid className="h-6 w-6 text-[#49363b]" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-full text-[#877a74] hover:text-[#49363b] hover:bg-[#49363b]/10"
              >
                <FlagIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextProgression}
                disabled={currentIndex === progressions.length - 1}
                className={`p-2 rounded-full ${
                  currentIndex === progressions.length - 1
                    ? 'text-[#877a74]/40 cursor-not-allowed'
                    : 'text-[#49363b] hover:bg-[#49363b]/10'
                }`}
              >
                <ArrowRightIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Progression insights */}
          <div className="p-4 sm:p-6">
            <h4 className="text-lg font-semibold text-[#49363b] mb-4">Insights</h4>
            <ProgressionAnalyzer 
              chords={currentProgression.chords.map(c => 
                typeof c === 'string' ? { name: c } : c
              )}
              keyName={currentProgression.key}
              scale={currentProgression.scale}
              insights={currentProgression.insights || []}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Hero section with warm color palette */}
        <div className="text-center mb-8 p-8">
          {/* Generator form */}
          <div className="max-w-xl mx-auto">
            <GeneratorForm
              onSearch={handleSearch}
              onGenerateWithAI={handleGenerateWithAI}
              isLoading={loading}
              fetchCount={fetchCount}
            />
          </div>
        </div>
        
        {/* Results section */}
        {loading ? renderLoadingState() : 
         noResultsFound ? renderNoResultsState() : 
         progressions.length > 0 ? renderProgressionContent() : null}
        
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

export default HomePage;
