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
    <div className=" border-t border-[#f9f5f1] overflow-hidden">
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
              <div className=" ">
                <button 
                  onClick={toggleInsights}
                  className="flex items-center bg- cursor-pointer justify-between w-full c text-sm font-semibold text-[#f9f5f1] mb-1 hover:bg-[#f9f5f1]/50 p-2 rounded-sm transition-colors"
                >
                  <h4>chord insights</h4>
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
                      <ul className="space-y-3 mt-2">
                        {insights.map((insight, index) => (
                          <li key={index} className="text-sm text-[#f9f5f1] flex items-start">
                            <span className="inline-block w-1 h-1 rounded-full bg-[#877a74] mt-2 mr-2 flex-shrink-0"></span>
                            <span>{insight}</span>
                          </li>
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
