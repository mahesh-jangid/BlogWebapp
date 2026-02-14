// Performance monitoring and metrics

import React from 'react';

type PerformanceMetric = {
  name: string;
  duration: number;
  timestamp: number;
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a metric
   */
  start(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and record metric
   */
  end(name: string) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Get average duration for a metric name
   */
  getAverageDuration(name: string) {
    const matching = this.metrics.filter((m) => m.name === name);
    if (matching.length === 0) return 0;
    const sum = matching.reduce((acc, m) => acc + m.duration, 0);
    return sum / matching.length;
  }

  /**
   * Print performance report
   */
  printReport() {
    console.group('📊 Performance Report');
    const grouped = this.metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = [];
        }
        acc[metric.name].push(metric.duration);
        return acc;
      },
      {} as Record<string, number[]>
    );

    Object.entries(grouped).forEach(([name, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      console.log(`${name}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * Decorator for React components to measure render time
 */
export const measureRenderTime = (componentName: string) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => {
      const startTime = performance.now();

      const element = React.createElement(Component, props);

      const endTime = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] render time: ${(endTime - startTime).toFixed(2)}ms`);
      }

      return element;
    };
  };
};

/**
 * Hook to measure component mount time
 */
export const useRenderTime = (componentName: string) => {
  React.useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] mounted in ${(end - start).toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};
