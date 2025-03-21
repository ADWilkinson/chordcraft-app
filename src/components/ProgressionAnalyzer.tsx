import { motion, AnimatePresence } from "framer-motion";

interface ProgressionAnalyzerProps {
  chords: { name: string }[];
  keyName: string;
  scale: string;
  insights: string[];
}

const ProgressionAnalyzer = ({ insights }: ProgressionAnalyzerProps) => {
  return (
    <div className="bg-white border-t border-[#877a74] overflow-hidden">
      {/* Content */}
      <div className="p-2">
        <AnimatePresence mode="wait" key="analyzer-tabs">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* AI insights */}
            {insights && insights.length > 0 && (
              <div className="p-2 bg-[#f9f5f1]/30  ">
                <h4 className="text-sm font-semibold text-[#49363b] mb-3">Chord Insights</h4>
                <ul className="space-y-3">
                  {insights.map((insight, index) => (
                    <li key={index} className="text-sm text-[#877a74] flex items-start">
                      <span className="inline-block w-1 h-1 rounded-full bg-[#877a74] mt-2 mr-2 flex-shrink-0"></span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressionAnalyzer;
