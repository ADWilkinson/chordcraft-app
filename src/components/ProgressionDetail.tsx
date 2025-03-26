import React, { useState, useEffect, useRef } from "react";
import {
  HeartIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import ProgressionPlayer from "./ProgressionPlayer";
import ProgressionAnalyzer from "./ProgressionAnalyzer";
import { ChordProgression } from "../types";
import ReportProgressionModal from "./ReportProgressionModal";
import { useSwipe } from "../hooks/useSwipe";

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
  onReport,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          if (!isFirst) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case "ArrowRight":
          if (!isLast) {
            e.preventDefault();
            onNext();
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          onToggleFavorite();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFirst, isLast, onPrevious, onNext, onToggleFavorite]);

  // Add swipe gesture support
  useSwipe(detailRef, {
    onSwipeLeft: !isLast ? onNext : undefined,
    onSwipeRight: !isFirst ? onPrevious : undefined,
  });

  const handleReportSubmit = async (reason: string, details: string) => {
    await onReport(reason, details);
    setShowReportModal(false);
  };

  const handleShare = () => {
    // Format the progression for sharing
    const chordNames = progression.chords
      .map((chord) =>
        typeof chord === "string" ? chord : chord.name || chord.notation || ""
      )
      .join(" - ");

    const shareText = `${progression.key} ${progression.scale} progression: ${chordNames} #ChordCraft`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      // Show toast notification
      setShowShareToast(true);
      // Hide after 2 seconds
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

  return (
    <div ref={detailRef} className="  pt-6">
      <div className="text-[#f9f5f1]">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2">
            {progression.key} {progression.scale}
          </h3>
          <p className="text-sm mb-4">
            {progression.mood} • {progression.style}
          </p>
        </div>

        {/* Player controls */}
        <div className="flex justify-center mb-4 mx-2 sm:mx-0">
          <ProgressionPlayer
            chords={progression.chords.map((c) =>
              typeof c === "string" ? { name: c, notation: c } : c
            )}
          />
        </div>

        {/* Navigation controls */}
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`p-2 rounded-full ${
              isFirst
                ? "cursor-not-allowed"
                : "hover:bg-[#f9f5f1]/30 cursor-pointer"
            }`}
            title={
              isFirst
                ? "No previous progression"
                : "Previous progression (Left arrow)"
            }
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-full hover:bg-[#f9f5f1]/30 cursor-pointer"
            title={
              isFavorite
                ? "Remove from favorites (F key)"
                : "Add to favorites (F key)"
            }
          >
            {isFavorite ? (
              <HeartIconSolid className="h-6 w-6" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-full hover:bg-[#f9f5f1]/30 cursor-pointer"
            title="Report this progression"
          >
            <FlagIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-[#f9f5f1]/30 cursor-pointer"
            title="Copy progression to clipboard"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className={`p-2 rounded-full ${
              isLast ? "cursor-not-allowed" : "hover:bg-[#f9f5f1]/30 cursor-pointer"
            }`}
            title={
              isLast ? "No next progression" : "Next progression (Right arrow)"
            }
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Keyboard shortcut help */}
        <div className="mt-6 hidden sm:block text-xs text-center text-[#f9f5f1]/70">
          <p>
            keyboard shortcuts: space (play/pause), R (reset), + / - (adjust
            tempo), ← → (navigate), F (favorite)
          </p>
          <p className="mt-1 sm:hidden">Swipe left/right to navigate</p>
        </div>
      </div>

      {/* Progression insights */}
      <div className="px-4 sm:px-6 py-4 sm:py-12">
        <ProgressionAnalyzer
          chords={progression.chords.map((c) =>
            typeof c === "string" ? { name: c } : c
          )}
          keyName={progression.key}
          scale={progression.scale}
          insights={progression.insights || []}
        />
      </div>

      {/* Report modal */}
      {showReportModal && (
        <ReportProgressionModal
          isOpen={true}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          progressionId={progression.id}
        />
      )}

      {/* Share toast notification */}
      {showShareToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-100 text-gray-600 px-4 py-2 rounded-md shadow-lg z-50 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default ProgressionDetail;
