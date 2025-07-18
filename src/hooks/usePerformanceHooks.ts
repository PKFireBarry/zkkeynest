import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor } from '@/lib/performance';

// Hook to measure component render time
export function useRenderTime(componentName: string) {
  const renderStartRef = useRef<number>(0);
  
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      performanceMonitor.recordMetric(`${componentName}_RENDER_TIME`, renderTime);
    }
  });
}

// Hook to measure component mount/unmount lifecycle
export function useComponentLifecycle(componentName: string) {
  useEffect(() => {
    const mountTime = performance.now();
    performanceMonitor.recordMetric(`${componentName}_MOUNT`, mountTime);

    return () => {
      const unmountTime = performance.now();
      performanceMonitor.recordMetric(`${componentName}_UNMOUNT`, unmountTime);
    };
  }, [componentName]);
}

// Hook to measure async operations
export function useAsyncPerformance() {
  const measureAsync = useCallback(async <T>(
    operationName: string,
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await asyncOperation();
      const endTime = performance.now();
      performanceMonitor.recordMetric(`ASYNC_${operationName}`, endTime - startTime, {
        success: true,
      });
      return result;
    } catch (error) {
      const endTime = performance.now();
      performanceMonitor.recordMetric(`ASYNC_${operationName}`, endTime - startTime, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, []);

  return { measureAsync };
}

// Hook to track scroll performance
export function useScrollPerformance(elementRef: React.RefObject<HTMLElement>) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const frameCountRef = useRef<number>(0);
  const scrollStartRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        scrollStartRef.current = performance.now();
        frameCountRef.current = 0;
      }

      frameCountRef.current++;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout to detect scroll end
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        if (scrollStartRef.current) {
          const scrollDuration = performance.now() - scrollStartRef.current;
          const fps = (frameCountRef.current / scrollDuration) * 1000;
          
          performanceMonitor.recordMetric('SCROLL_PERFORMANCE', scrollDuration, {
            frameCount: frameCountRef.current,
            fps: Math.round(fps),
            smooth: fps >= 55, // Consider 55+ FPS as smooth
          });
        }
      }, 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [elementRef, isScrolling]);

  return { isScrolling };
}

// Hook to measure memory usage
export function useMemoryMonitoring(intervalMs: number = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return;
    }

    const measureMemory = () => {
      const memory = (performance as any).memory as {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
      const info = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
      
      setMemoryInfo(info);
      performanceMonitor.recordMetric('MEMORY_USAGE', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      });
    };

    measureMemory();
    const interval = setInterval(measureMemory, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return memoryInfo;
}

// Hook to track network performance
export function useNetworkPerformance() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) {
      return;
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection as {
                        effectiveType?: string;
                        downlink?: number;
                        rtt?: number;
                        saveData?: boolean;
                        addEventListener: (event: string, callback: () => void) => void;
                        removeEventListener: (event: string, callback: () => void) => void;
                      };

    if (connection) {
      const updateNetworkInfo = () => {
        const info = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        };
        
        setNetworkInfo(info);
        performanceMonitor.recordMetric('NETWORK_INFO', connection.downlink || 0, {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// Hook to track page visibility and performance impact
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const visibilityStartRef = useRef<number>(performance.now());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = performance.now();
      const wasVisible = isVisible;
      const currentlyVisible = !document.hidden;
      
      setIsVisible(currentlyVisible);

      if (wasVisible && !currentlyVisible) {
        // Page became hidden
        performanceMonitor.recordMetric('PAGE_VISIBLE_DURATION', now - visibilityStartRef.current);
      } else if (!wasVisible && currentlyVisible) {
        // Page became visible
        visibilityStartRef.current = now;
        performanceMonitor.recordMetric('PAGE_VISIBILITY_CHANGE', now, {
          type: 'visible',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVisible]);

  return isVisible;
}