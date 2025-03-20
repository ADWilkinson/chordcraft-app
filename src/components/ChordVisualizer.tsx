import { motion } from 'framer-motion';

interface ChordVisualizerProps {
  chord: string;
  numeral?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ChordVisualizer = ({ 
  chord, 
  numeral, 
  isActive = false, 
  onClick 
}: ChordVisualizerProps) => {
  return (
    <motion.div
      className={`
        p-3 rounded-lg border cursor-pointer
        ${isActive 
          ? 'border-zinc-400 bg-zinc-200' 
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
        }
        transition-all duration-200
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
          : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-medium text-zinc-900">{chord}</span>
        {numeral && (
          <span className="text-xs text-zinc-500 mt-1">{numeral}</span>
        )}
      </div>
    </motion.div>
  );
};

export default ChordVisualizer;
