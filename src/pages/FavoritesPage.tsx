import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ChordProgression from '../components/ChordProgression';
import { useFavorites } from '../hooks/useFavorites';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  HomeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui-kit/button';
import { Spinner } from '../components/ui-kit/spinner';

const FavoritesPage = () => {
  const { favorites, loading, loadFavorites } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Adjust current index if needed when favorites change
  useEffect(() => {
    if (currentIndex >= favorites.length && favorites.length > 0) {
      setCurrentIndex(favorites.length - 1);
    } else if (favorites.length === 0) {
      setCurrentIndex(0);
    }
  }, [favorites, currentIndex]);

  const currentProgression = favorites[currentIndex];

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

  const handleFavoriteToggle = (_id: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // If unfavorited, reload favorites
      loadFavorites();
    }
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
            Your Favorites
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Revisit your musical inspirations
          </p>
        </motion.div>

        <div className="mb-6 flex justify-center">
          <Link to="/">
            <Button className="flex items-center justify-center py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <HomeIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8 text-indigo-600" />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-zinc-50 rounded-xl p-8 max-w-lg mx-auto border border-zinc-200">
              <HeartIcon className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">No Favorites Yet</h3>
              <p className="text-zinc-600 mb-6">
                Heart the progressions you love to save them here
              </p>
              <Link to="/">
                <Button className="flex items-center justify-center py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Find Progressions
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {currentProgression && (
                <motion.div
                  key={`progression-${currentIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChordProgression 
                    progression={currentProgression} 
                    key={currentProgression.id}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation controls */}
            {favorites.length > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-4">
                <Button
                  onClick={goToPreviousProgression}
                  disabled={currentIndex === 0}
                  className={`flex items-center justify-center p-2 rounded-full ${
                    currentIndex === 0
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  } transition-colors`}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                
                <div className="text-zinc-600 text-sm">
                  {currentIndex + 1} of {favorites.length}
                </div>
                
                <Button
                  onClick={goToNextProgression}
                  disabled={currentIndex === favorites.length - 1}
                  className={`flex items-center justify-center p-2 rounded-full ${
                    currentIndex === favorites.length - 1
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  } transition-colors`}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
