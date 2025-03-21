import React, { useState } from 'react';
import {
  HeartIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import ProgressionPlayer from './ProgressionPlayer';
import ProgressionAnalyzer from './ProgressionAnalyzer';
import { ChordProgression } from '../types';
import ReportProgressionModal from './ReportProgressionModal';

interface ProgressionDetailProps {
  progression: ChordProgression;
  isFavorite: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggleFavorite: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReport: (reason: string, details: string) => Promise<void>;
}

const ProgressionDetail: React.FC<ProgressionDetailProps> = ({
  progression,
  isFavorite,
  isFirst,
  isLast,
  onToggleFavorite,
  onPrevious,
  onNext,
  onReport
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReportSubmit = async (reason: string, details: string) => {
    await onReport(reason, details);
    setShowReportModal(false);
  };

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold text-[#49363b] mb-2">
            {progression.key} {progression.scale}
          </h3>
          <p className="text-[#877a74] text-sm mb-4">
            {progression.mood} • {progression.style}
          </p>
        </div>
        
        {/* Player controls */}
        <div className="flex justify-center mb-4">
          <ProgressionPlayer 
            chords={progression.chords.map(c => 
              typeof c === 'string' ? { name: c, notation: c } : c
            )} 
            tempo={90}
          />
        </div>
        
        {/* Navigation controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`p-2 rounded-full ${
              isFirst
                ? 'text-[#877a74]/40 cursor-not-allowed'
                : 'text-[#49363b] hover:bg-[#49363b]/10 cursor-pointer'
            }`}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-full text-[#49363b] hover:bg-[#49363b]/10 cursor-pointer"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-6 w-6 text-[#49363b]" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-full text-[#877a74] hover:text-[#49363b] hover:bg-[#49363b]/10 cursor-pointer"
          >
            <FlagIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className={`p-2 rounded-full ${
              isLast
                ? 'text-[#877a74]/40 cursor-not-allowed'
                : 'text-[#49363b] hover:bg-[#49363b]/10 cursor-pointer'
            }`}
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Progression insights */}
      <div className="px-4 sm:px-6 py-4 sm:py-12">
        <ProgressionAnalyzer
          chords={progression.chords.map(c => 
            typeof c === 'string' ? { name: c } : c
          )}
          keyName={progression.key}
          scale={progression.scale}
          insights={progression.insights || []}
        />
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportProgressionModal
          isOpen={true}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          progressionId={progression.id}
        />
      )}
    </div>
  );
};

export default ProgressionDetail;
