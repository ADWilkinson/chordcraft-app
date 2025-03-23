import { useState, useEffect, useRef } from 'react';
import { isPlatformWeb } from '../utils/platform';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * Cross-platform swipe detection hook that works for both web and React Native
 */
export const useSwipe = (
  { onSwipeLeft, onSwipeRight }: SwipeHandlers,
  threshold = 50
) => {
  // For web platforms
  const webRef = useRef<HTMLElement | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance required
  const minSwipeDistance = threshold;

  // Web implementation
  useEffect(() => {
    if (!isPlatformWeb()) return; // Skip on mobile
    
    const element = document.body; // Default to body
    webRef.current = element;
    
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, minSwipeDistance]);

  // For React Native
  const handleGesture = (gestureState: { dx: number }) => {
    if (isPlatformWeb()) return; // Skip on web
    
    const { dx } = gestureState;
    
    if (dx > minSwipeDistance && onSwipeRight) {
      onSwipeRight();
    } else if (dx < -minSwipeDistance && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  return {
    webRef,
    handleGesture
  };
};