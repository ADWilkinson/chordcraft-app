import { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-[#49363b] text-white shadow-lg hover:bg-[#241c1c] transition-all duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-[#e5d8ce] focus:ring-offset-2"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
