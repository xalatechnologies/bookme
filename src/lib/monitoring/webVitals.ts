/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals metrics for performance monitoring:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - INP (Interaction to Next Paint) - Interactivity (replaces FID)
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial load
 * - TTFB (Time to First Byte) - Server response
 *
 * @see https://web.dev/vitals/
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals thresholds (Google recommendations)
 */
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

/**
 * Rating based on threshold
 */
type Rating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a metric
 */
function getRating(name: string, value: number): Rating {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Log metric to console (development)
 */
function logMetric(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';

  console.log(
    `${emoji} ${metric.name}:`,
    metric.value.toFixed(2),
    metric.rating,
    `(${rating})`
  );
}

/**
 * Send metric to analytics service
 * TODO: Integrate with your analytics service (Google Analytics, PostHog, etc.)
 */
function sendToAnalytics(metric: Metric): void {
  // Example: Send to Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     event_category: 'Web Vitals',
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }

  // Example: Send to custom API
  // fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     name: metric.name,
  //     value: metric.value,
  //     rating: metric.rating,
  //     delta: metric.delta,
  //     id: metric.id,
  //     navigationType: metric.navigationType,
  //   }),
  // });

  // For now, just log in development
  if (import.meta.env.DEV) {
    logMetric(metric);
  }
}

/**
 * Report Web Vitals metrics
 */
export function reportWebVitals(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    if (import.meta.env.DEV) {
      console.log('📊 Web Vitals monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get current Web Vitals snapshot
 * Useful for debugging or displaying in UI
 */
export function getWebVitalsSnapshot(): Promise<Record<string, Metric>> {
  return new Promise((resolve) => {
    const metrics: Record<string, Metric> = {};
    let count = 0;
    const total = 5;

    const checkComplete = () => {
      count++;
      if (count === total) {
        resolve(metrics);
      }
    };

    onCLS((metric) => {
      metrics.CLS = metric;
      checkComplete();
    });
    onFCP((metric) => {
      metrics.FCP = metric;
      checkComplete();
    });
    onINP((metric) => {
      metrics.INP = metric;
      checkComplete();
    });
    onLCP((metric) => {
      metrics.LCP = metric;
      checkComplete();
    });
    onTTFB((metric) => {
      metrics.TTFB = metric;
      checkComplete();
    });

    // Timeout after 3 seconds
    setTimeout(() => resolve(metrics), 3000);
  });
}

export { THRESHOLDS, type Rating };
