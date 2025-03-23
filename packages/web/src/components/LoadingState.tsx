import React from 'react';

const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#49363b]"></div>
  </div>
);

export default LoadingState;
