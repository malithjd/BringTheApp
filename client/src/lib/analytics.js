import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

/**
 * Initialize PostHog analytics.
 * Call once on app mount. No-ops silently if key is missing.
 */
export function initAnalytics() {
  if (!POSTHOG_KEY || initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Privacy-friendly defaults
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,           // auto-track clicks, inputs, form submits
    session_recording: {
      maskAllInputs: true,       // mask PII in session replays
      maskTextSelector: '[data-pii]',
    },
    persistence: 'localStorage',
    loaded: () => { initialized = true; },
  });
}

/**
 * Track a custom event. No-ops if PostHog isn't initialized.
 */
export function track(event, properties = {}) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

/**
 * Identify a user (for future auth features).
 */
export function identify(userId, traits = {}) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, traits);
}

/**
 * Reset user identity (on logout / start over).
 */
export function resetIdentity() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

// ---- Pre-defined event helpers for key product moments ----

/** User uploaded documents for OCR scanning */
export function trackOcrScan(pageCount, provider) {
  track('ocr_scan_started', { page_count: pageCount, provider });
}

/** OCR extraction completed */
export function trackOcrResult(success, fieldCount, pageCount, provider) {
  track('ocr_scan_completed', {
    success,
    fields_extracted: fieldCount,
    page_count: pageCount,
    provider,
  });
}

/** User submitted the form for deal analysis */
export function trackDealAnalyzed(result) {
  track('deal_analyzed', {
    score: result.score,
    label: result.label,
    vehicle_make: result.vehicle?.make,
    vehicle_model: result.vehicle?.model,
    vehicle_year: result.vehicle?.year,
    condition: result.vehicle?.condition,
    price: result.entered?.price,
    apr: result.entered?.apr,
    term: result.entered?.term,
    is_cash_deal: !result.entered?.term || result.entered.term === 0,
    state: result.calculated?.state,
    red_flag_count: result.flags?.redFlags?.length || 0,
    green_flag_count: result.flags?.greenFlags?.length || 0,
    addon_count: result.entered?.addons?.length || 0,
    total_addons: result.calculated?.totalAddons || 0,
  });
}

/** User clicked "Start Over" */
export function trackStartOver(fromView) {
  track('start_over', { from_view: fromView });
}

/** User chose manual entry instead of OCR */
export function trackSkipOcr() {
  track('skip_ocr');
}

/** User clicked "Email This Report" */
export function trackEmailReport() {
  track('email_report');
}

/** User used a negotiation script (copy) */
export function trackCopyScript(issue) {
  track('copy_negotiation_script', { issue });
}
