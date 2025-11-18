// app/uisrc/utils/webVitals.ts
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

const VITALS_ENDPOINT = "/app/api/vitals";
const VITALS_ENABLED = false; // Desabilitado até endpoint ser implementado no backend

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log("[Web Vitals]", metric.name, metric.value);
  }

  // Send to analytics endpoint in production (apenas se habilitado)
  if (import.meta.env.PROD && VITALS_ENABLED) {
    const body = JSON.stringify(metric);
    const blob = new Blob([body], { type: "application/json" });

    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      try {
        navigator.sendBeacon(VITALS_ENDPOINT, blob);
      } catch (error) {
        // Silenciosamente ignora erros de sendBeacon
      }
    } else {
      fetch(VITALS_ENDPOINT, {
        body,
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Ignore errors in production
      });
    }
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
