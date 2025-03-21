import { useState, useCallback } from "react";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";

import Layout from "../components/Layout";
import GeneratorForm from "../components/GeneratorForm";
import EmptyState from "../components/EmptyState";
import ProgressionDetail from "../components/ProgressionDetail";
import ProgressionSkeleton from "../components/ProgressionSkeleton";
import { fetchRandomProgression, requestChordProgression } from "../services/progressionService";
import { useFavorites } from "../hooks/useFavorites";
import { reportProgression } from "../services/reportService";
import { useProgressionNavigation } from "../hooks/useProgressionNavigation";

const HomePage = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  
  // Use the favorites hook
  const { isFavorite, toggleFavorite } = useFavorites();

  // Use the progression navigation hook
  const {
    progressions,
    currentIndex,
    currentProgression,
    goToNextProgression,
    goToPreviousProgression,
    addProgression
  } = useProgressionNavigation();

  // Handler for fetching random progressions
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const fetchedProgression = await fetchRandomProgression();
      setFetchCount(prev => prev + 1);
      
      if (fetchedProgression) {
        addProgression(fetchedProgression);
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error fetching progression:', err);
      setNoResultsFound(true);
    } finally {
      setLoading(false);
    }
  }, [addProgression]);

  // Handler for generating progressions with AI
  const handleGenerateWithAI = useCallback(async () => {
    setLoading(true);
    setNoResultsFound(false);
    try {
      const newProgression = await requestChordProgression({});
      
      if (newProgression) {
        addProgression(newProgression);
      } else {
        setNoResultsFound(true);
      }
    } catch (err) {
      console.error('Error generating with AI:', err);
      setNoResultsFound(true);
    } finally {
      setLoading(false);
    }
  }, [addProgression]);

  // Report handler
  const handleReportProgression = useCallback(async (reason: string, details: string) => {
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
  }, [currentProgression]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GeneratorForm 
          onSearch={handleSearch} 
          onGenerateWithAI={handleGenerateWithAI} 
          fetchCount={fetchCount}
          isLoading={loading}
        />
        
        {loading ? (
          <div className="mb-8">
            <ProgressionSkeleton />
          </div>
        ) : noResultsFound ? (
          <EmptyState 
            icon={<MusicalNoteIcon className="h-12 w-12 text-[#877a74]" />}
            title="No progressions found"
            description="Try generating a new progression with AI."
            actionButton={
              <button
                onClick={handleGenerateWithAI}
                className="px-4 py-2 bg-[#49363b] text-white rounded-sm hover:bg-[#49363b]/80 transition-colors"
              >
                generate with AI
              </button>
            }
          />
        ) : currentProgression ? (
          <div className="mb-8">
            <ProgressionDetail
              progression={currentProgression}
              isFavorite={isFavorite(currentProgression.id)}
              isFirst={currentIndex === 0}
              isLast={currentIndex === progressions.length - 1}
              onToggleFavorite={() => toggleFavorite(currentProgression)}
              onPrevious={goToPreviousProgression}
              onNext={goToNextProgression}
              onReport={handleReportProgression}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default HomePage;
