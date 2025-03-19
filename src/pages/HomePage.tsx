import { useState } from 'react';
import Layout from '../components/Layout';
import GeneratorForm from '../components/GeneratorForm';
import ChordProgression from '../components/ChordProgression';
import { ChordProgression as ChordProgressionType, GenerationParams } from '../types';
import { fetchProgressions } from '../services/progressionService';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressions, setProgressions] = useState<ChordProgressionType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProgressions = await fetchProgressions(params);
      
      if (fetchedProgressions.length === 0) {
        setError('No chord progressions found with those parameters. Try different options or leave some fields empty for broader results.');
      } else {
        setProgressions(fetchedProgressions);
      }
    } catch (err) {
      console.error('Error generating progressions:', err);
      setError('An error occurred while generating chord progressions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Generate Beautiful Chord Progressions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Use AI to craft the perfect chord progression for your next song. Customize by key, scale, mood, and style.
          </p>
        </div>

        <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {progressions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Chord Progressions</h2>
            <div className="space-y-6">
              {progressions.map((progression) => (
                <ChordProgression key={progression.id} progression={progression} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
