import { useState } from "react";
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
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Use the favorites hook instead of managing favorites directly
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentProgression = progressions[currentIndex];

  const handleSearch = async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const fetchedProgression = await fetchRandomProgression();
      setFetchCount(prev => prev + 1);
      if (fetchedProgression) {
        setProgressions([fetchedProgression]);
        setCurrentIndex(0);
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error fetching progression:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      // Generate a new progression with AI
      const newProgression = await requestChordProgression({});
      if (newProgression) {
        const newProgressions = [...progressions, newProgression];
        setProgressions(newProgressions);
        setCurrentIndex(newProgressions.length - 1); // Set to the new progression
        
        // Show a success toast
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error generating with AI:', err);
      
      // Show an error toast
    } finally {
      setLoading(false);
    }
  };

  const handlePrevProgression = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextProgression = () => {
    if (currentIndex < progressions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReportProgression = async (reason: string, details: string) => {
    if (currentProgression) {
      try {
        await reportProgression(currentProgression.id, reason, details);
        setShowReportModal(false);
        // Show success message
      } catch (error) {
        console.error('Error reporting progression:', error);
        // Show error message
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Hero section with warm color palette */}
        <div className="text-center mb-8 p-8 ">
  
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
        {progressions.length > 0 && (
          <div className="mb-8">
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
                  <button
                    onClick={() => toggleFavorite(currentProgression)}
                    className="p-2 rounded-full hover:bg-[#e5d8ce]/50 transition-colors"
                    aria-label={isFavorite(currentProgression.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(currentProgression.id) ? (
                      <HeartIconSolid className="h-6 w-6 text-[#49363b]" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-[#877a74] hover:text-[#49363b]" />
                    )}
                  </button>
                  
                  {/* Report button */}
                  <button
                    onClick={() => setShowReportModal(true)}
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
                        onClick={handlePrevProgression}
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
                        {currentIndex + 1} of {progressions.length}
                      </span>
                      
                      <button
                        onClick={handleNextProgression}
                        disabled={currentIndex === progressions.length - 1}
                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                          currentIndex === progressions.length - 1
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
                      insights={currentProgression.insights}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49363b]"></div>
          </div>
        )}
        
        {/* No results state */}
        {noResultsFound && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border border-[#877a74]/20 shadow-sm">
            <FlagIcon className="h-12 w-12 text-[#877a74] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#49363b] mb-2">No progressions found</h3>
            <p className="text-[#877a74] mb-4">Try different search criteria or generate a new progression with AI.</p>
            <button
              onClick={handleGenerateWithAI}
              disabled={loading}
              className="px-4 py-2 bg-[#49363b] text-white rounded-md hover:bg-[#49363b]/80 transition-colors"
            >
              Generate with AI
            </button>
          </div>
        )}
      </div>
      
      {/* Report modal */}
      <ReportProgressionModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportProgression}
        progressionId={currentProgression?.id || ''}
      />
    </Layout>
  );
};

export default HomePage;
