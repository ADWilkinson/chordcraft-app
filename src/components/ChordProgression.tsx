import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, HeartIcon, FlagIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ChordProgression as ChordProgressionType } from '../types';
import ReportProgressionModal from './ReportProgressionModal';
import { reportProgression } from '../services/reportService';
import { isFavorite, toggleFavorite } from '../services/favoriteService';

// Local interface for display purposes
interface DisplayChord {
  name: string;
  notes: string[];
  function?: string;
}

interface ChordProgressionProps {
  progression: ChordProgressionType;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const ChordProgression = ({ progression, onFavoriteToggle }: ChordProgressionProps) => {
  const [showInsights, setShowInsights] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Check if progression is in favorites on component mount
  useEffect(() => {
    if (progression.id) {
      setLiked(isFavorite(progression.id));
    }
  }, [progression.id]);

  // Convert string chords to display chords if needed
  const displayChords: DisplayChord[] = progression.chords.map(chord => {
    if (typeof chord === 'string') {
      return {
        name: chord,
        notes: [chord], // Simple placeholder for notes
        function: undefined
      };
    } else {
      return {
        name: chord.name,
        notes: [chord.notation || chord.name], // Use notation if available
        function: chord.function
      };
    }
  });

  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  const toggleLike = () => {
    if (!progression.id) {
      console.error('Cannot favorite progression without ID');
      return;
    }
    
    const isNowFavorite = toggleFavorite(progression);
    setLiked(isNowFavorite);
    
    // Notify parent component if callback is provided
    if (onFavoriteToggle && progression.id) {
      onFavoriteToggle(progression.id, isNowFavorite);
    }
  };

  const handleReport = async (reason: string, details: string) => {
    if (!progression.id) {
      console.error('Cannot report progression without ID');
      return Promise.reject(new Error('Missing progression ID'));
    }
    
    try {
      await reportProgression(progression.id, reason, details);
      return Promise.resolve();
    } catch (error) {
      console.error('Error reporting progression:', error);
      return Promise.reject(error);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-md shadow-md overflow-hidden border border-zinc-100 hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      {/* Header with key and scale info */}
      <div className="bg-zinc-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MusicalNoteIcon className="h-5 w-5 text-white/80" />
          <h3 className="text-lg font-medium">
            {progression.key} {progression.scale}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          {progression.mood && (
            <span className="text-sm px-3 py-1 bg-white/10 rounded-md capitalize">
              {progression.mood}
            </span>
          )}
          {progression.style && (
            <span className="text-sm px-3 py-1 bg-white/10 rounded-md capitalize">
              {progression.style}
            </span>
          )}
        </div>
      </div>

      {/* Chord display */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {displayChords.slice(0, 8).map((chord, index) => (
            <motion.div 
              key={`${chord.name}-${index}`} 
              className="flex flex-col items-center justify-center p-5 bg-white rounded-md border border-zinc-200 hover:border-black transition-all shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-xs text-zinc-500 mb-1">{index + 1}</span>
              <h4 className="text-2xl font-bold text-zinc-900">{chord.name}</h4>
              <span className="text-xs text-zinc-500 mt-1">{chord.function || ''}</span>
            </motion.div>
          ))}
        </div>

        {/* AI Generated Badge */}
        {progression.isAIGenerated && (
          <div className="mb-6 px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-md text-sm text-zinc-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Just generated, thank you for contributing to ChordCraft
          </div>
        )}

        {/* Interactive buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={toggleLike}
              className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5 text-red-500 mr-1.5" />
              ) : (
                <HeartIcon className="h-5 w-5 mr-1.5" />
              )}
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
              onClick={() => setShowReportModal(true)}
            >
              <FlagIcon className="h-5 w-5 mr-1.5" />
              <span>Report</span>
            </button>
          </div>
          
          {progression.insights && progression.insights.length > 0 && (
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md transition-colors relative group"
              onClick={toggleInsights}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MusicalNoteIcon className="h-5 w-5" />
              <span className="font-medium">Musical Insights</span>
              <motion.div
                animate={{ rotate: showInsights ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="h-5 w-5" />
              </motion.div>
            </motion.button>
          )}
        </div>
      </div>

      {/* Insights section */}
      <div className="border-t border-zinc-200">
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-5 bg-zinc-50">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center">
                  <MusicalNoteIcon className="h-5 w-5 mr-2" />
                  Why This Progression Works
                </h3>
                <ol className="space-y-4">
                  {progression.insights.map((insight, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-zinc-200 text-zinc-800 text-sm font-bold mr-3 mt-0.5">{index + 1}</span>
                      <span className="text-zinc-700">{insight}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Actions footer */}
      <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            className="flex items-center text-zinc-500 hover:text-indigo-600 transition-colors"
            onClick={toggleLike}
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 text-indigo-600 mr-1" />
            ) : (
              <HeartIcon className="h-5 w-5 mr-1" />
            )}
            <span className="text-sm">{progression.likes || 0}</span>
          </button>
          
          <button 
            className="flex items-center text-zinc-500 hover:text-red-600 transition-colors"
            onClick={() => setShowReportModal(true)}
          >
            <FlagIcon className="h-5 w-5 mr-1" />
            <span className="text-sm">{progression.flags || 0}</span>
          </button>
        </div>
        
        <div className="text-xs text-zinc-400">
          Created {(progression.createdAt instanceof Date 
            ? progression.createdAt 
            : progression.createdAt && typeof progression.createdAt.toDate === 'function'
              ? new Date(progression.createdAt.toDate())
              : progression.createdAt && progression.createdAt.seconds
                ? new Date(progression.createdAt.seconds * 1000)
                : new Date()).toLocaleDateString()}
        </div>
      </div>

      {/* Report Modal */}
      <ReportProgressionModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        progressionId={progression.id || ''}
      />
    </motion.div>
  );
};

export default ChordProgression;
