import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface ProgressionAnalyzerProps {
  chords: { name: string }[];
  keyName: string;
  scale: string;
  insights: string[];
}

const ProgressionAnalyzer = ({ insights }: ProgressionAnalyzerProps) => {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const toggleInsights = () => {
    setIsInsightsOpen(!isInsightsOpen);
  };

  return (
    <div className="border-t border-[#f9f5f1]/30 overflow-hidden">
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
              <div className="rounded-sm overflow-hidden">
                <button
                  onClick={toggleInsights}
                  className="flex items-center cursor-pointer justify-between w-full text-sm font-semibold text-[#f9f5f1] mb-1 hover:bg-[#f9f5f1]/20 p-3 rounded-sm transition-all duration-200"
                >
                  <h4 className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#e5d8ce] mr-2"></span>
                    chord insights
                  </h4>
                  {isInsightsOpen ? (
                    <ChevronUpIcon className="h-4 w-4 text-[#f9f5f1]" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-[#f9f5f1]" />
                  )}
                </button>

                <AnimatePresence>
                  {isInsightsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-4 mt-3 pl-2 pr-3 pb-2">
                        {insights.map((insight, index) => (
                          <motion.li
                            key={index}
                            className="text-sm text-[#f9f5f1] flex items-start"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e5d8ce]/70 mt-1.5 mr-3 flex-shrink-0"></span>
                            <span className="leading-relaxed">{insight}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressionAnalyzer;
