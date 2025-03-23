const ProgressionSkeleton = () => {
  return (
    <div className="animate-pulse pt-6 mt-6">
      {/* Header skeleton */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-7 w-40 bg-[#e5d8ce] rounded mb-2"></div>
        <div className="h-4 w-32 bg-[#e5d8ce] rounded"></div>
      </div>
      
      {/* Chord grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index}
            className="rounded-sm px-3 py-6 flex flex-col items-center justify-center min-h-[60px] bg-[#e5d8ce]"
          ></div>
        ))}
      </div>
      
      {/* Controls skeleton */}
      <div className="flex justify-center items-center space-x-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#e5d8ce]"></div>
        <div className="w-10 h-10 rounded-full bg-[#e5d8ce]"></div>
        <div className="w-10 h-10 rounded-full bg-[#e5d8ce]"></div>
        <div className="w-10 h-10 rounded-full bg-[#e5d8ce]"></div>
      </div>
      
      {/* Analysis skeleton */}
      <div className="px-4 sm:px-6 py-4 sm:py-12">
        <div className="h-6 w-48 bg-[#e5d8ce] rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-[#e5d8ce] rounded"></div>
          <div className="h-4 w-5/6 bg-[#e5d8ce] rounded"></div>
          <div className="h-4 w-4/6 bg-[#e5d8ce] rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionSkeleton;
