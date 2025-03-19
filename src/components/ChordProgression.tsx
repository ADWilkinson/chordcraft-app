import { useState } from 'react';
import { ChordProgression as ChordProgressionType } from '../types';
import { likeProgression, flagProgression } from '../services/progressionService';
import { motion } from 'framer-motion';

interface ChordProgressionProps {
  progression: ChordProgressionType;
}

const ChordProgression = ({ progression }: ChordProgressionProps) => {
  const [liked, setLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const handleLike = async () => {
    if (!liked) {
      try {
        await likeProgression(progression.id);
        setLiked(true);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">
          {progression.key} {progression.scale}
        </h3>
        <div className="text-sm text-gray-300">
          {progression.mood} • {progression.style}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {progression.chords.map((chord, index) => (
          <div 
            key={index} 
            className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700 hover:border-indigo-500 transition-colors"
          >
            <div className="text-xl font-bold text-white">{chord.name}</div>
            <div className="text-xs text-gray-400 mt-1">{chord.function || ''}</div>
          </div>
        ))}
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

      <div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center text-sm ${
            liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill={liked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {liked ? 'Liked' : 'Like'}
        </button>

        <button
          onClick={handleFlag}
          disabled={flagged}
          className={`flex items-center text-sm ${
            flagged ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill={flagged ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
          {flagged ? 'Flagged' : 'Flag Issue'}
        </button>
      </div>
    </motion.div>
  );
};

export default ChordProgression;
