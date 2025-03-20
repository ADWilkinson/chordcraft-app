import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChordProgression as ChordProgressionType } from '../types';
import { 
  HeartIcon,
  FlagIcon,
  MusicalNoteIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ReportProgressionModal from './ReportProgressionModal';
import { reportProgression } from '../services/reportService';
import { isFavorite, toggleFavorite } from '../services/favoriteService';
import ProgressionPlayer from './ProgressionPlayer';
import ProgressionAnalyzer from './ProgressionAnalyzer';

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

  // Helper function to format scale names
  const formatScaleName = (scale: string) => {
    if (!scale) return '';
    
    // Replace underscores with spaces
    let formattedScale = scale.replace(/_/g, ' ');
    
    // Capitalize the first letter of each word
    formattedScale = formattedScale
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return formattedScale;
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
            Chord Progression
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm px-3 py-1 bg-white/10 rounded-md capitalize">
            {progression.key} {formatScaleName(progression.scale)}
          </span>
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-black">Chord Progression</h3>
            <div className="flex items-center mt-1">
              <span className="text-sm text-zinc-500 mr-2">
                {progression.key} {formatScaleName(progression.scale)}
              </span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              <span className="text-sm text-zinc-500 ml-2 capitalize">
                {progression.mood}
              </span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full mx-2"></span>
              <span className="text-sm text-zinc-500 capitalize">
                {progression.style}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleLike}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            >
              {liked ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-zinc-400 hover:text-red-500" />
              )}
            </button>
            
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-full hover:bg-zinc-100 transition-colors ml-1"
              aria-label="Report progression"
            >
              <FlagIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-700" />
            </button>
          </div>
        </div>
        
        <ProgressionPlayer 
          chords={progression.chords.map(c => typeof c === 'string' ? c : c.name)} 
          numerals={progression.numerals}
          keyContext={progression.key}
        />
      </div>

      {/* Insights section */}
      <div className="border-t border-zinc-200 p-6">
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ProgressionAnalyzer 
                chords={progression.chords.map(c => typeof c === 'string' ? c : c.name)}
                key={progression.key}
                scale={progression.scale}
                insights={progression.insights || []}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          className="flex items-center text-zinc-500 hover:text-indigo-600 transition-colors mt-4"
          onClick={toggleInsights}
        >
          {showInsights ? (
            <ChevronUpIcon className="h-5 w-5 mr-1" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 mr-1" />
          )}
          <span className="text-sm">{showInsights ? 'Hide insights' : 'Show insights'}</span>
        </button>
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
