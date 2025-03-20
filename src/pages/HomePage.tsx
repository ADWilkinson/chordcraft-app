import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import GeneratorForm from '../components/GeneratorForm';
import ChordProgression from '../components/ChordProgression';
import { fetchProgressions } from '../services/progressionService';
import { GenerationParams, ChordProgression as ChordProgressionType } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui-kit/button';
import { Spinner } from '../components/ui-kit/spinner';

const HomePage = () => {
  const [progressions, setProgressions] = useState<ChordProgressionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const currentProgression = progressions[currentIndex];

  const handleSearch = async (params: GenerationParams) => {
    setLoading(true);
    setError(null);
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
        notes: [chord.notation], // Using notation as notes
        function: chord.function
      };
    });
    
    return {
      id: progression.id,
      key: progression.key,
      scale: progression.scale,
      chords: formattedChords,
      mood: progression.mood,
      style: progression.style,
      insights: progression.insights,
      createdAt: progression.createdAt instanceof Date 
        ? progression.createdAt 
        : new Date(progression.createdAt.toDate())
    };
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
            Discover Perfect <span className="inline-block">Chord Progressions</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
            Generate beautiful chord progressions for your next musical masterpiece
          </p>
          
         
        </motion.div>
        
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <GeneratorForm onSubmit={handleSearch} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}
        
        {progressions.length > 0 && currentProgression && (
          <div className="mt-8">
            {formatProgressionForComponent(currentProgression) && (
              <ChordProgression progression={formatProgressionForComponent(currentProgression)!} />
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" data-slot="icon" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600 mx-2">
                  {currentIndex + 1} of {progressions.length}
                </span>
                
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === progressions.length - 1}
                  className="flex items-center"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" data-slot="icon" />
                </Button>
              </div>
              
              <Button
                onClick={toggleForm}
                className="flex items-center"
                color="zinc"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" data-slot="icon" />
                {showForm ? "Hide Search" : "Modify Search"}
              </Button>
            </div>
          </div>
        )}
        
        {!loading && progressions.length === 0 && (
          <motion.div 
            className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg 
              className="w-16 h-16 mx-auto text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No chord progressions yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Use the search form to generate chord progressions based on your preferences.
            </p>
            {progressions.length === 0 && (
            <Button
              onClick={toggleForm}
              className="flex items-center mx-auto"
            >
              {showForm ? (
                <>
                  <XMarkIcon className="h-5 w-5 mr-2" data-slot="icon" />
                  Hide Search
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" data-slot="icon" />
                  Find Progressions
                </>
              )}
            </Button>
          )}
          </motion.div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner className="h-12 w-12" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
