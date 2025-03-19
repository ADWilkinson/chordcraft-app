import { useState } from 'react';
import Layout from '../components/Layout';
import GeneratorForm from '../components/GeneratorForm';
import ChordProgression from '../components/ChordProgression';
import { ChordProgression as ChordProgressionType, GenerationParams } from '../types';
import { fetchProgressions } from '../services/progressionService';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressions, setProgressions] = useState<ChordProgressionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleFetch = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProgressions = await fetchProgressions(params);
      
      if (fetchedProgressions.length === 0) {
        setError('No chord progressions found with those parameters. Try different options or leave some fields empty for broader results.');
      } else {
        setProgressions(fetchedProgressions);
        setCurrentIndex(0);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error fetching progressions:', err);
      setError('An error occurred while fetching chord progressions. Please try again later.');
    } finally {
      setIsLoading(false);
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

  const currentProgression = progressions[currentIndex];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Discover Beautiful Chord Progressions
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Find the perfect chord progression for your next song.
          </p>
          <button 
            onClick={toggleForm}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Hide Search' : 'Search Progressions'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <GeneratorForm 
              onFetch={handleFetch} 
              isLoading={isLoading} 
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-black p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {progressions.length > 0 && (
          <div className="mt-8">
            <ChordProgression progression={currentProgression} />
            
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              <div className="text-black">
                {currentIndex + 1} of {progressions.length}
              </div>
              <button
                onClick={handleNext}
                disabled={currentIndex === progressions.length - 1}
                className="px-4 py-2 bg-black text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
