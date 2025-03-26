import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useFavorites } from "../hooks/useFavorites";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ProgressionDetail from "../components/ProgressionDetail";
import ProgressionCard from "../components/ProgressionCard";
import { reportProgression } from "../services/reportService";
import { HeartIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const FavoritesPage = () => {
  // State management
  const { favorites, loading, toggleFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedProgressionId, setSelectedProgressionId] = useState<
    string | null
  >(null);

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
  const handleSelectProgression = useCallback(
    (id: string) => {
      const index = favorites.findIndex((prog) => prog.id === id);
      if (index !== -1) {
        setCurrentIndex(index);
        setSelectedProgressionId(id);
        setViewMode("detail");
      }
    },
    [favorites]
  );

  const handleBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedProgressionId(null);
  }, []);

  // Report handler
  const handleReportProgression = useCallback(
    async (reason: string, details: string) => {
      if (currentProgression) {
        try {
          await reportProgression(currentProgression.id, reason, details);
          return Promise.resolve();
        } catch (error) {
          console.error("Error reporting progression:", error);
          return Promise.reject(error);
        }
      }
      return Promise.reject(new Error("No progression selected"));
    },
    [currentProgression]
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto sm:px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#f9f5f1] flex items-center">
            my favorites
          </h1>
          {viewMode === "detail" && (
            <button
              onClick={handleBackToList}
              className="px-3 py-1.5 bg-[#e5d8ce] text-[#49363b] rounded-sm hover:bg-[#e5d8ce]/80 transition-all duration-200 cursor-pointer flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              back to list
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={<HeartIcon className="h-12 w-12 text-[#e5d8ce]/50" />}
            title="No favorites yet"
            description="Find progressions you like and save them to your favorites."
            actionButton={
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-[#49363b] text-white rounded-sm hover:bg-[#49363b]/80 transition-colors cursor-pointer"
              >
                discover progressions
              </Link>
            }
          />
        ) : viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {favorites.map((progression) => (
                <motion.div
                  key={progression.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <ProgressionCard
                    progression={progression}
                    isFavorite={true}
                    onSelect={() => handleSelectProgression(progression.id)}
                    onToggleFavorite={() => toggleFavorite(progression)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : currentProgression ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressionDetail
                progression={currentProgression}
                isFavorite={true}
                isFirst={currentIndex === 0}
                isLast={currentIndex === favorites.length - 1}
                onToggleFavorite={() => toggleFavorite(currentProgression)}
                onPrevious={goToPreviousProgression}
                onNext={goToNextProgression}
                onReport={handleReportProgression}
              />
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
