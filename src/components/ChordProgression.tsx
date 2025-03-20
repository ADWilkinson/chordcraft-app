import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, HeartIcon, FlagIcon, InformationCircleIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Divider } from './ui-kit/divider';

interface Chord {
  name: string;
  notes: string[];
  function?: string;
}

interface ChordProgression {
  id: string;
  key: string;
  scale: string;
  chords: Chord[];
  mood?: string;
  style?: string;
  insights?: string[];
  createdAt: Date;
}

interface ChordProgressionProps {
  progression: ChordProgression;
}

const ChordProgression = ({ progression }: ChordProgressionProps) => {
  const [showInsights, setShowInsights] = useState(false);
  const [liked, setLiked] = useState(false);

  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      {/* Header with key and scale info */}
      <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MusicalNoteIcon className="h-5 w-5 text-white/80" />
          <h3 className="text-lg font-medium">
            {progression.key} {progression.scale}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          {progression.mood && (
            <span className="text-sm px-3 py-1 bg-white/10 rounded-full capitalize">
              {progression.mood}
            </span>
          )}
          {progression.style && (
            <span className="text-sm px-3 py-1 bg-white/10 rounded-full capitalize">
              {progression.style}
            </span>
          )}
        </div>
      </div>

      {/* Chord display */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {progression.chords.map((chord, index) => (
            <motion.div
              key={`${chord.name}-${index}`}
              className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                {index + 1}
              </span>
              <span className="text-2xl font-bold text-black block mb-2">
                {chord.name}
              </span>
              <span className="text-xs text-gray-600 block">
                {chord.notes.join(' • ')}
              </span>
              {chord.function && (
                <span className="mt-2 inline-block text-xs px-2 py-1 bg-black/5 rounded-full text-gray-700">
                  {chord.function}
                </span>
              )}
            </motion.div>
          ))}
        </div>

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
            >
              <FlagIcon className="h-5 w-5 mr-1.5" />
              <span>Report</span>
            </button>
          </div>
          
          {progression.insights && progression.insights.length > 0 && (
            <button
              onClick={toggleInsights}
              className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              <InformationCircleIcon className="h-5 w-5 mr-1.5" />
              <span>Insights</span>
              {showInsights ? (
                <ChevronUpIcon className="h-4 w-4 ml-1.5" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 ml-1.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Insights panel */}
      <AnimatePresence>
        {showInsights && progression.insights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <h4 className="text-lg font-medium text-black mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                Musical Insights
              </h4>
              <Divider className="my-3" />
              <ul className="space-y-3">
                {progression.insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation date footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Created {progression.createdAt.toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default ChordProgression;
