// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0ca895054e37e0b2eee4f62634746eff@o1336776.ingest.us.sentry.io/4509785057132544",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Disable content masking for session replay
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out errors from browser extensions and third-party scripts
  beforeSend(event, hint) {
    const error = hint.originalException;
    const errorMessage = typeof error === 'string' ? error : (error as Error)?.message;
    
    // List of error patterns to ignore (from browser extensions/third-party scripts)
    const ignorePatterns = [
      /runtime\.sendMessage/i,
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-extension:\/\//i,
      // Add more patterns as needed for other common browser extension errors
    ];

    // Check if error message matches any ignore pattern
    if (errorMessage && ignorePatterns.some(pattern => pattern.test(errorMessage))) {
      return null; // Don't send to Sentry
    }

    // Check if error originates from extension scripts
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      const hasExtensionFrame = frames.some(frame => 
        frame.filename && (
          frame.filename.includes('extension://') ||
          frame.filename.includes('moz-extension://') ||
          frame.filename.includes('safari-extension://')
        )
      );
      
      if (hasExtensionFrame) {
        return null; // Don't send to Sentry
      }
    }

    // Enhance image-related errors with additional context
    if (errorMessage && (
      /invalid origin/i.test(errorMessage) ||
      /CORS/i.test(errorMessage) ||
      /cross-origin/i.test(errorMessage) ||
      /image/i.test(errorMessage) ||
      /Failed to load resource/i.test(errorMessage)
    )) {
      // Add browser and page context
      if (typeof window !== 'undefined') {
        event.contexts = event.contexts || {};
        event.contexts.browser = {
          ...event.contexts.browser,
          name: navigator.userAgent,
          version: navigator.userAgent,
        };
        
        event.tags = event.tags || {};
        event.tags.error_type = 'image_loading';
        event.tags.current_url = window.location.href;
        
        // Add custom context about images on the page
        const images = Array.from(document.querySelectorAll('img'));
        event.extra = event.extra || {};
        event.extra.image_count = images.length;
        event.extra.image_sources = images.slice(0, 10).map(img => ({
          src: img.src,
          alt: img.alt,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }));
        
        // Check for cross-origin images
        const currentOrigin = window.location.origin;
        const crossOriginImages = images.filter(img => {
          try {
            const imgUrl = new URL(img.src);
            return imgUrl.origin !== currentOrigin;
          } catch {
            return false;
          }
        });
        event.extra.cross_origin_image_count = crossOriginImages.length;
        event.extra.cross_origin_image_sources = crossOriginImages.slice(0, 5).map(img => img.src);
      }
    }

    return event;
  },
});

// Global unhandled rejection handler with enhanced context
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorMessage = typeof error === 'string' ? error : (error as Error)?.message;
    
    // Only capture if it's not already being handled
    if (errorMessage) {
      // Check if it's an image-related error
      const isImageError = /invalid origin/i.test(errorMessage) ||
        /CORS/i.test(errorMessage) ||
        /cross-origin/i.test(errorMessage) ||
        /image/i.test(errorMessage) ||
        /Failed to load resource/i.test(errorMessage);
      
      if (isImageError) {
        Sentry.captureException(error, {
          tags: {
            error_type: 'unhandled_promise_rejection',
            image_related: 'true',
          },
          extra: {
            promise_rejection: true,
            error_message: errorMessage,
            current_url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
          contexts: {
            browser: {
              name: navigator.userAgent,
            },
          },
        });
      } else {
        // Capture other unhandled rejections with context
        Sentry.captureException(error, {
          tags: {
            error_type: 'unhandled_promise_rejection',
          },
          extra: {
            promise_rejection: true,
            error_message: errorMessage,
            current_url: window.location.href,
          },
        });
      }
    }
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;