import React from "react";
import { HeartIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ChordProgression } from "../types";

interface ProgressionCardProps {
  progression: ChordProgression;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const ProgressionCard: React.FC<ProgressionCardProps> = ({
  progression,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <div  onClick={onSelect} className="bg-white rounded-sm border border-[#877a74]/80 cursor-pointer  overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 bg-[#f9f5f1]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-[#49363b]">
            {progression.key} {progression.scale}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onToggleFavorite}
              className="p-1.5 rounded-full hover:bg-[#e5d8ce]/50 transition-colors"
            >
              {isFavorite ? (
                <HeartIconSolid className="h-5 w-5 text-[#49363b] cursor-pointer" />
              ) : (
                <HeartIcon className="h-5 w-5 text-[#877a74] hover:text-[#49363b] cursor-pointer" />
              )}
            </button>
          </div>
        </div>

        {/* Tags/badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {progression.mood && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e5d8ce]/70 text-[#49363b] text-xs font-medium">
              {progression.mood}
            </span>
          )}
          {progression.style && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e5d8ce]/70 text-[#49363b] text-xs font-medium">
              {progression.style}
            </span>
          )}
        </div>

        {/* Chord preview */}
        <div className="flex flex-wrap gap-2 mb-3 ">
          {progression.chords.map((chord, index) => (
            <span
              key={`${progression.id}-chord-${index}`}
              className="inline-block px-3 py-1.5 bg-white border border-[#877a74]/80 rounded-sm text-sm text-[#49363b] font-medium"
            >
              {typeof chord === "string"
                ? chord
                : chord.name || chord.notation || ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressionCard;
