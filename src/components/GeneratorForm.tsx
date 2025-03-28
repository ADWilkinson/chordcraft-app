import { useState, useEffect } from "react";
import { LightBulbIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Spinner } from "./ui-kit/spinner";

interface GeneratorFormProps {
  onSearch: (params: { useRandomProgression?: boolean }) => Promise<void>;
  onGenerateWithAI?: () => Promise<void>;
  isLoading: boolean;
  fetchCount: number;
}

export default function GeneratorForm({
  onSearch,
  onGenerateWithAI,
  isLoading,
  fetchCount,
}: GeneratorFormProps) {
  const [showAIOption, setShowAIOption] = useState(false);

  // Show AI option after 5 fetches
  useEffect(() => {
    if (fetchCount >= 5 && !showAIOption) {
      setShowAIOption(true);
    }
  }, [fetchCount, showAIOption]);

  const handleRandomSearch = async () => {
    await onSearch({ useRandomProgression: true });
  };

  const handleAISearch = async () => {
    if (onGenerateWithAI) {
      await onGenerateWithAI();
    }
  };

  // Common button style for both buttons
  const buttonBaseClass =
    "w-full sm:w-auto px-8 py-3 border border-[#f9f5f1]/30  text-white rounded-sm shadow-sm cursor-pointer transition-colors font-medium flex items-center justify-center";
  const inspireButtonClass = `${buttonBaseClass} bg-[#49363b] hover:bg-[#49363b]/90 ${
    fetchCount === 0 ? 'animate-pulse-slow ' : ''
  }`;
  const aiButtonClass = `${buttonBaseClass} bg-gradient-to-r from-[#49363b] to-[#6b4c52] hover:from-[#49363b]/90 hover:to-[#6b4c52]/90 mx-auto`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-[#f9f5f1] rounded-sm mb-0.5 pb-6 pt-8  ">
        <div className="text-center mb-4">
          <div className="inline-block ">
            <span className="text-3xl font-bold tracking-tight flex items-center justify-center">
              <span className="mr-2 text-4xl">
                <div className="relative h-8 w-8 mr-2">
                  <svg viewBox="0 0 40 40" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Piano keys base */}

                    <rect x="2" y="5" width="36" height="30" rx="3" fill="#e5d8ce" stroke="#49363b" strokeWidth="1.5" />
                    {/* White keys */}
                    <rect x="4" y="8" width="5" height="22" rx="1" fill="white" stroke="#877a74" strokeWidth="0.5" />
                    <rect x="11" y="8" width="5" height="22" rx="1" fill="white" stroke="#877a74" strokeWidth="0.5" />
                    <rect x="18" y="8" width="5" height="22" rx="1" fill="white" stroke="#877a74" strokeWidth="0.5" />
                    <rect x="25" y="8" width="5" height="22" rx="1" fill="white" stroke="#877a74" strokeWidth="0.5" />
                    <rect x="32" y="8" width="4" height="22" rx="1" fill="white" stroke="#877a74" strokeWidth="0.5" />
                    {/* Black keys */}
                    <rect x="8" y="8" width="4" height="14" rx="1" fill="#241c1c" />
                    <rect x="15" y="8" width="4" height="14" rx="1" fill="#241c1c" />
                    <rect x="22" y="8" width="4" height="14" rx="1" fill="#49363b" />
                    <rect x="29" y="8" width="4" height="14" rx="1" fill="#241c1c" />
                    {/* Sound wave accent */}
                    <path d="M10,36 Q15,32 20,36 Q25,40 30,36" stroke="#49363b" strokeWidth="1.5" fill="none" />
                  </svg>
                </div>
              </span>
              <span className="text-[#f9f5f1]">chord</span>
              <span className="text-[#f9f5f1]">craft</span>
            </span>
            {!showAIOption ? (
              <p className="text-[#f9f5f1]/80 pt-4 text-sm">unblock your creativity</p>
            ) : (
              <p className="text-[#f9f5f1]/80 pt-4 text-sm">find something truly unique</p>
            )}
          </div>
        </div>
        <div className="flex sm:mx-0 mx-6 items-center justify-center border-t border-[#877a74]/20 py-4 ">
          <button onClick={handleRandomSearch} disabled={isLoading} className={inspireButtonClass}>
            {isLoading ? (
              <>
                <Spinner className="h-5 w-5 mr-3 text-white " />
                inspire me
              </>
            ) : (
              <>
                <LightBulbIcon className="h-5 w-5 mr-3" />
                inspire me
              </>
            )}
          </button>

          {showAIOption && (
            <div className="ml-3 relative group">
              <button
                onClick={handleAISearch}
                disabled={isLoading}
                className={`${aiButtonClass} relative`}
                aria-label="Generate with AI"
              >
                {isLoading ? (
                  <>
                    <Spinner className="h-5 w-5 mr-3 text-white" />
                    generate with AI
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-3" />
                    generate with AI
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
