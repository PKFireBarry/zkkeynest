'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor, PerformanceEntry, PerformanceMetrics } from '@/lib/performance';
import { useMemoryMonitoring, useNetworkPerformance } from '@/hooks/usePerformanceHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceDashboardProps {
  showInProduction?: boolean;
}

export function PerformanceDashboard({ showInProduction = false }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceEntry[]>([]);
  const [report, setReport] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDashboardEnabled, setIsDashboardEnabled] = useState(false);
  
  const memoryInfo = useMemoryMonitoring(2000);
  const networkInfo = useNetworkPerformance();

  // Keyboard shortcut to toggle dashboard (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsDashboardEnabled(prev => !prev);
        if (!isDashboardEnabled) {
          console.log('🚀 Performance Dashboard Enabled');
        } else {
          console.log('📊 Performance Dashboard Disabled');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDashboardEnabled]);

  useEffect(() => {
    // Only run monitoring when dashboard is enabled
    if (!isDashboardEnabled) {
      return;
    }

    // Only show in development unless explicitly enabled for production
    if (process.env.NODE_ENV === 'production' && !showInProduction) {
      return;
    }

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      performanceMonitor.generateReport().then(setReport);
    }, 1000);

    return () => clearInterval(interval);
  }, [showInProduction, isDashboardEnabled]);

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  // Don't render anything if dashboard is not enabled
  if (!isDashboardEnabled) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceRating = (metric: string, value: number) => {
    switch (metric) {
      case 'FCP':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'LCP':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'FID':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      case 'TTFB':
        return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'neutral';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          📊 Performance
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Web Vitals */}
          {report?.webVitals && (
            <div>
              <h4 className="font-semibold mb-2">Core Web Vitals</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.webVitals).map(([key, value]) => {
                  if (value === undefined) return null;
                  const rating = getPerformanceRating(key.toUpperCase(), value);
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="uppercase">{key}:</span>
                      <div className="flex items-center gap-1">
                        <span>{formatMs(value)}</span>
                        <Badge className={`w-2 h-2 p-0 ${getRatingColor(rating)}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bundle Size */}
          {report?.bundleSize && (
            <div>
              <h4 className="font-semibold mb-1">Bundle Size</h4>
              <div className="flex justify-between">
                <span>Total JS:</span>
                <span>{formatBytes(report.bundleSize)}</span>
              </div>
            </div>
          )}

          {/* Memory Usage */}
          {memoryInfo && (
            <div>
              <h4 className="font-semibold mb-1">Memory Usage</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full"
                    style={{
                      width: `${(memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Network Info */}
          {networkInfo.effectiveType && (
            <div>
              <h4 className="font-semibold mb-1">Network</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{networkInfo.effectiveType}</span>
                </div>
                {networkInfo.downlink && (
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span>{networkInfo.downlink} Mbps</span>
                  </div>
                )}
                {networkInfo.rtt && (
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{networkInfo.rtt}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Metrics */}
          <div>
            <h4 className="font-semibold mb-1">Recent Metrics</h4>
            <div className="max-h-20 overflow-y-auto space-y-1">
              {metrics.slice(-5).reverse().map((metric, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="truncate">{metric.name}:</span>
                  <span>{formatMs(metric.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => {
                performanceMonitor.clearMetrics();
                setMetrics([]);
              }}
              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Clear
            </button>
            <button
              onClick={() => {
                performanceMonitor.generateReport().then(report => {
                  console.log('Performance Report:', report);
                  console.log('All Metrics:', performanceMonitor.getMetrics());
                });
              }}
              className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Log Report
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}