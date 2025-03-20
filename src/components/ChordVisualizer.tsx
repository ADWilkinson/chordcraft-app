import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChordVisualizerProps {
  chords: string[];
  numerals?: string[];
  activeIndex?: number;
  onChordClick?: (index: number) => void;
}

const ChordVisualizer = ({ 
  chords, 
  numerals, 
  activeIndex = -1, 
  onChordClick 
}: ChordVisualizerProps) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  // Generate a color based on the chord name
  const getChordColor = (chord: string) => {
    // Simple hash function to generate a consistent hue for each chord
    const hash = chord.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use the hash to generate a hue (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return a desaturated color to match our design
    return `hsl(${hue}, 15%, 92%)`;
  };

  return (
    <div className="py-6 mb-4">
      <div className="flex flex-wrap justify-center gap-4">
        {chords.map((chord, index) => (
          <motion.div
            key={`${chord}-${index}`}
            className="relative cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChordClick && onChordClick(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
          >
            <div 
              className={`w-20 h-20 rounded-md flex items-center justify-center shadow-md transition-all ${
                activeIndex === index 
                  ? 'ring-2 ring-zinc-800 bg-zinc-100' 
                  : 'bg-white border border-zinc-200'
              }`}
              style={{
                backgroundColor: activeIndex === index ? '#f4f4f5' : getChordColor(chord),
                transform: `rotate(${hoveredIndex === index ? '0deg' : '0deg'})`,
              }}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-800">{chord}</div>
                {numerals && numerals[index] && (
                  <div className="text-xs text-zinc-500 mt-1">{numerals[index]}</div>
                )}
              </div>
            </div>
            
            {/* Position indicator */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
              <span className="text-xs font-medium text-zinc-500">{index + 1}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChordVisualizer;
