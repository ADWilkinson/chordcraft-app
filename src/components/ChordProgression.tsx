import { useState } from 'react';
import { ChordProgression as ChordProgressionType, Chord } from '../types';
import { likeProgression, flagProgression } from '../services/progressionService';
import { motion } from 'framer-motion';

interface ChordProgressionProps {
  progression: ChordProgressionType;
}

const ChordProgression = ({ progression }: ChordProgressionProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  if (!progression) return null;

  const handleLike = async () => {
    if (!isLiked) {
      try {
        await likeProgression(progression.id);
        setIsLiked(true);
      } catch (error) {
        console.error('Error liking progression:', error);
      }
    }
  };

  const handleFlag = async () => {
    if (!flagged) {
      try {
        await flagProgression(progression.id);
        setFlagged(true);
      } catch (error) {
        console.error('Error flagging progression:', error);
      }
    }
  };

  // Function to determine if a chord is a string or Chord object
  const isChordObject = (chord: string | Chord): chord is Chord => {
    return typeof chord !== 'string' && chord !== null && typeof chord === 'object';
  };

  // Function to get chord name from either string or Chord object
  const getChordName = (chord: string | Chord): string => {
    if (isChordObject(chord)) {
      return chord.name;
    }
    return chord;
  };

  // Function to get chord function from Chord object or empty string
  const getChordFunction = (chord: string | Chord): string => {
    if (isChordObject(chord)) {
      return chord.function || '';
    }
    return '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-black">
            {progression.key} {progression.scale}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <span className="mr-3">
              {progression.mood && `Mood: ${progression.mood}`}
            </span>
            {progression.style && (
              <span className="mr-3">Style: {progression.style}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleLike}
          className={`p-2 rounded-full ${
            isLiked ? 'text-red-500' : 'text-gray-400'
          } hover:bg-gray-100 transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={isLiked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isLiked ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <button
          onClick={handleFlag}
          disabled={flagged}
          className={`p-2 rounded-full ${
            flagged ? 'text-yellow-500' : 'text-gray-400'
          } hover:bg-gray-100 transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={flagged ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={flagged ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
        </button>
      </div>

      <div className="flex overflow-x-auto py-4 scrollbar-hide">
        <div className="flex space-x-3">
          {progression.chords && progression.chords.map((chord, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="w-20 h-32 flex flex-col items-center justify-center bg-white border-2 border-black rounded-md shadow-md relative"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #ffffff, #f5f5f5)'
                }}
              >
                <span className="text-2xl font-bold text-black">
                  {getChordName(chord)}
                </span>
                {getChordFunction(chord) && (
                  <span className="text-xs text-gray-600 mt-1">
                    {getChordFunction(chord)}
                  </span>
                )}
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-black opacity-10 rounded-b-md"></div>
              </motion.div>
              <span className="mt-2 text-sm text-gray-600">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 transition-transform ${showInsights ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showInsights ? 'Hide Insights' : 'Show Insights'}
        </button>

        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 text-sm text-gray-300 space-y-2"
          >
            <h4 className="font-medium text-indigo-400">Insights:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {progression.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
        <span>Created: {progression.createdAt ? new Date(progression.createdAt instanceof Date ? progression.createdAt : progression.createdAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString()}</span>
        <span>{progression.likes || 0} likes</span>
      </div>
    </motion.div>
  );
};

export default ChordProgression;
