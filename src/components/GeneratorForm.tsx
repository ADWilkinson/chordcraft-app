import { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
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
  const buttonBaseClass = "w-full sm:w-auto px-8 py-3 text-white rounded-md shadow-sm transition-colors font-medium flex items-center justify-center";
  const inspireButtonClass = `${buttonBaseClass} bg-[#49363b] hover:bg-[#49363b]/90`;
  const aiButtonClass = `${buttonBaseClass} bg-gradient-to-r from-[#49363b] to-[#6b4c52] hover:from-[#49363b]/90 hover:to-[#6b4c52]/90 mx-auto`;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-[#f9f5f1] rounded-md border border-[#877a74]/20 shadow-sm p-6 mb-8">
        <div className="text-center mb-4">
          <div className="inline-block ">
            <span className="text-3xl font-bold tracking-tight flex items-center justify-center">
              <span className="mr-2 text-4xl">
                <div className="relative h-8 w-8 mr-2">
                  <svg
                    viewBox="0 0 40 40"
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Piano keys base */}

                    <rect
                      x="2"
                      y="5"
                      width="36"
                      height="30"
                      rx="3"
                      fill="#e5d8ce"
                      stroke="#49363b"
                      strokeWidth="1.5"
                    />
                    {/* White keys */}
                    <rect
                      x="4"
                      y="8"
                      width="5"
                      height="22"
                      rx="1"
                      fill="white"
                      stroke="#877a74"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="11"
                      y="8"
                      width="5"
                      height="22"
                      rx="1"
                      fill="white"
                      stroke="#877a74"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="18"
                      y="8"
                      width="5"
                      height="22"
                      rx="1"
                      fill="white"
                      stroke="#877a74"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="25"
                      y="8"
                      width="5"
                      height="22"
                      rx="1"
                      fill="white"
                      stroke="#877a74"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="32"
                      y="8"
                      width="4"
                      height="22"
                      rx="1"
                      fill="white"
                      stroke="#877a74"
                      strokeWidth="0.5"
                    />
                    {/* Black keys */}
                    <rect
                      x="8"
                      y="8"
                      width="4"
                      height="14"
                      rx="1"
                      fill="#241c1c"
                    />
                    <rect
                      x="15"
                      y="8"
                      width="4"
                      height="14"
                      rx="1"
                      fill="#241c1c"
                    />
                    <rect
                      x="22"
                      y="8"
                      width="4"
                      height="14"
                      rx="1"
                      fill="#49363b"
                    />
                    <rect
                      x="29"
                      y="8"
                      width="4"
                      height="14"
                      rx="1"
                      fill="#241c1c"
                    />
                    {/* Sound wave accent */}
                    <path
                      d="M10,36 Q15,32 20,36 Q25,40 30,36"
                      stroke="#49363b"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>
              </span>
              <span className="text-[#241c1c]">Chord</span>
              <span className="text-[#49363b]">Craft</span>
              
            </span>
            <p className="text-[#241c1c]/80 pt-4">Unblock your creativity</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
        <button
          onClick={handleRandomSearch}
          disabled={isLoading}
          className={inspireButtonClass}
        >
          {isLoading ? (
            <Spinner className="h-5 w-5 text-white" />
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Inspire Me
            </>
          )}
        </button>

        {showAIOption && (
          <div className="w-full pt-4 border-t border-[#877a74]/20">
            <div className="text-center mb-4">
              <span className="text-md  px-2 py-1 rounded-full">
                Want something truly unique?
              </span>
            </div>
            <button
              onClick={handleAISearch}
              disabled={isLoading}
              className={aiButtonClass}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5 text-white" />
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Generate with AI
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
