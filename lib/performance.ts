// Performance optimization utilities

import React from 'react';

/**
 * Debounce function - limits function calls during rapid events
 * Useful for search inputs, resize handlers, etc.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function - calls function at most once per interval
 * Useful for scroll events, animations, etc.
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize function results - caches results based on arguments
 * Useful for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(func: T) => {
  const cache = new Map();

  return (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Intersection Observer hook helper - for lazy loading content
 * Useful for images, sections that are offscreen
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

/**
 * Request idle callback wrapper - runs function when browser is idle
 * Useful for non-critical operations
 */
export const requestIdleCallback = (callback: () => void, options?: IdleRequestOptions) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options);
  } else {
    setTimeout(callback, 1);
  }
};
