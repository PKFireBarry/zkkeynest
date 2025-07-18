import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface PerformanceMetrics {
  bundleSize?: number;
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  offlineCapability: boolean;
  webVitals: {
    cls?: number;
    fid?: number;
    fcp?: number;
    lcp?: number;
    ttfb?: number;
  };
}

export interface PerformanceEntry {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceEntry[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private webVitalsData: PerformanceMetrics['webVitals'] = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializePerformanceObservers();
    }
  }

  private initializeWebVitals() {
    // Collect Core Web Vitals
    onCLS((metric: Metric) => {
      this.webVitalsData.cls = metric.value;
      this.recordMetric('CLS', metric.value, { rating: metric.rating });
    });

    onINP((metric: Metric) => {
      this.webVitalsData.fid = metric.value;
      this.recordMetric('INP', metric.value, { rating: metric.rating });
    });

    onFCP((metric: Metric) => {
      this.webVitalsData.fcp = metric.value;
      this.recordMetric('FCP', metric.value, { rating: metric.rating });
    });

    onLCP((metric: Metric) => {
      this.webVitalsData.lcp = metric.value;
      this.recordMetric('LCP', metric.value, { rating: metric.rating });
    });

    onTTFB((metric: Metric) => {
      this.webVitalsData.ttfb = metric.value;
      this.recordMetric('TTFB', metric.value, { rating: metric.rating });
    });
  }

  private initializePerformanceObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('DOM_CONTENT_LOADED', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
              this.recordMetric('LOAD_EVENT', navEntry.loadEventEnd - navEntry.loadEventStart);
              this.recordMetric('DNS_LOOKUP', navEntry.domainLookupEnd - navEntry.domainLookupStart);
              this.recordMetric('TCP_CONNECTION', navEntry.connectEnd - navEntry.connectStart);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.recordMetric(`RESOURCE_${resourceEntry.name}`, resourceEntry.duration, {
                size: resourceEntry.transferSize,
                type: resourceEntry.initiatorType,
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const entry: PerformanceEntry = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };
    
    this.metrics.push(entry);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}ms`, metadata);
    }
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
    };
  }

  measureComponent(componentName: string) {
    return {
      onMount: () => {
        this.recordMetric(`${componentName}_MOUNT`, performance.now());
      },
      onRender: (renderTime: number) => {
        this.recordMetric(`${componentName}_RENDER`, renderTime);
      },
      onUnmount: () => {
        this.recordMetric(`${componentName}_UNMOUNT`, performance.now());
      },
    };
  }

  getMetrics(): PerformanceEntry[] {
    return [...this.metrics];
  }

  getWebVitals(): PerformanceMetrics['webVitals'] {
    return { ...this.webVitalsData };
  }

  clearMetrics() {
    this.metrics = [];
  }

  getBundleSize(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(resource => 
          resource.name.includes('.js') && 
          resource.name.includes('/_next/static/')
        );
        
        const totalSize = jsResources.reduce((sum, resource) => {
          return sum + (resource.transferSize || 0);
        }, 0);
        
        resolve(totalSize);
      } else {
        resolve(0);
      }
    });
  }

  generateReport(): Promise<PerformanceMetrics> {
    return new Promise(async (resolve) => {
      const bundleSize = await this.getBundleSize();
      const loadTime = this.metrics.find(m => m.name === 'LOAD_EVENT')?.value || 0;
      const renderTime = this.metrics.filter(m => m.name.includes('_RENDER')).reduce((sum, m) => sum + m.value, 0);
      
      const report: PerformanceMetrics = {
        bundleSize,
        loadTime,
        renderTime,
        cacheHitRate: 0, // Will be implemented with caching system
        offlineCapability: false, // Will be implemented with service worker
        webVitals: this.webVitalsData,
      };
      
      resolve(report);
    });
  }

  disconnect() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    measureComponent: performanceMonitor.measureComponent.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
}