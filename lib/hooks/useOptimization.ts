'use client';

import { useState, useMemo } from 'react';

interface PaginationOptions {
  itemsPerPage?: number;
  currentPage?: number;
}

/**
 * Hook for paginating large lists
 * Helps improve performance by limiting DOM nodes rendered
 */
export const usePagination = <T,>(
  items: T[],
  options: PaginationOptions = {}
) => {
  const { itemsPerPage = 10, currentPage: initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
};

/**
 * Hook for virtual scrolling - renders only visible items
 * Great for very large lists (100s or 1000s of items)
 */
export const useVirtualScroll = <T,>(
  items: T[],
  {
    itemHeight,
    containerHeight,
    bufferSize = 5,
  }: {
    itemHeight: number;
    containerHeight: number;
    bufferSize?: number;
  }
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, bufferSize, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, idx) => ({
      item,
      index: visibleRange.startIndex + idx,
    }));
  }, [items, visibleRange]);

  const offsetY = visibleRange.startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    setScrollTop,
  };
};
