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

    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;