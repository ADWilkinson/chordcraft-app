import { motion } from 'framer-motion';
import { GenerationParams } from '../types';
import { Button } from './ui-kit/button';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface GeneratorFormProps {
  onSearch: () => Promise<void>;
  onGenerateWithAI: (params: GenerationParams) => Promise<void>;
  loading: boolean;
  noResultsFound?: boolean;
  fetchCount: number;
}

const GeneratorForm = ({ onSearch, onGenerateWithAI, loading, noResultsFound, fetchCount }: GeneratorFormProps) => {
  // No need to store params as state anymore
  
  const handleInspireMe = (e: React.MouseEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleGenerateWithAI = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Generate random parameters for more variety
    const randomParams: GenerationParams = {
      key: '',  // Empty string means random
      scale: '',
      startingChord: '',
      mood: '',
      style: '',
    };
    
    onGenerateWithAI(randomParams);
  };

  const showAIOption = fetchCount >= 5;

  return (
    <motion.div 
      className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mb-8 border border-zinc-100 hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <motion.div 
          className="inline-block mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.span 
            className="text-3xl font-bold tracking-tight flex items-center justify-center"
          >
            <motion.span 
              className="mr-2 text-4xl"
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatDelay: 5,
                duration: 0.5 
              }}
            >
              🎵
            </motion.span>
            <span className="text-zinc-900">Chord</span>
            <span className="text-indigo-600">Craft</span>
          </motion.span>
        </motion.div>
        <p className="text-zinc-600">Find the perfect chord progression for your next creation</p>
      </div>
      
      {noResultsFound && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium">No matching progressions found</p>
          <p className="mt-1">Try clicking "Inspire Me" again or generate a new progression with AI</p>
        </div>
      )}
      
      <div className="flex flex-col gap-5">
        <Button
          onClick={handleInspireMe}
          disabled={loading}
          className="flex items-center justify-center cursor-pointer py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-lg shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finding Inspiration...
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              Inspire Me
            </>
          )}
        </Button>
        
        {showAIOption && (
          <motion.div 
            className="mt-2 p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-lg border border-zinc-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-zinc-800 mb-2">Ready for something unique?</h3>
            <p className="text-zinc-600 mb-4">Let AI create a custom progression tailored just for you!</p>
            <Button
              onClick={handleGenerateWithAI}
              disabled={loading}
              className="flex items-center justify-center py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors w-full shadow-md hover:shadow-lg"
            >
              {loading && noResultsFound ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GeneratorForm;
