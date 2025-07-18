export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    console.log('Performance monitoring initialized on server');
    
    // Track server-side performance metrics
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const timestamp = new Date().toISOString();
      originalConsoleLog(`[${timestamp}]`, ...args);
    };

    // Monitor memory usage
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        console.log('[Performance] Server Memory:', {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        });
      }, 30000); // Every 30 seconds
    }

    // Track request timing
    const originalFetch = global.fetch;
    if (originalFetch) {
      global.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          console.log(`[Performance] Fetch ${args[0]}: ${duration.toFixed(2)}ms`);
          return response;
        } catch (error) {
          const duration = performance.now() - start;
          console.log(`[Performance] Fetch ${args[0]} failed: ${duration.toFixed(2)}ms`);
          throw error;
        }
      };
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    console.log('Performance monitoring initialized on edge runtime');
    
    // Track edge function performance
    const originalFetch = globalThis.fetch;
    if (originalFetch) {
      globalThis.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          console.log(`[Performance] Edge Fetch ${args[0]}: ${duration.toFixed(2)}ms`);
          return response;
        } catch (error) {
          const duration = performance.now() - start;
          console.log(`[Performance] Edge Fetch ${args[0]} failed: ${duration.toFixed(2)}ms`);
          throw error;
        }
      };
    }
  }
}