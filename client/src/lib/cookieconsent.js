import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

/**
 * Initialize cookie consent banner.
 * - "Necessary" category is always enabled (no cookies currently)
 * - "Analytics" category gates PostHog — blocked until user accepts
 *
 * Returns a promise that resolves when consent UI is ready.
 * Call initAnalytics() only after checking acceptedCategory('analytics').
 */
export function initCookieConsent() {
  return CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: 'box inline',
        position: 'bottom left',
      },
      preferencesModal: {
        layout: 'box',
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: /^ph_/ },         // PostHog cookies
            { name: /^_posthog/ },
          ],
        },
      },
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'We value your privacy',
            description:
              'We use analytics cookies to understand how you use BringTheApp so we can improve the experience. No personal data from your documents is ever stored or tracked.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Necessary only',
            showPreferencesBtn: 'Manage preferences',
          },
          preferencesModal: {
            title: 'Cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Necessary only',
            savePreferencesBtn: 'Save preferences',
            sections: [
              {
                title: 'Strictly necessary',
                description:
                  'Essential for the app to function. No tracking, no personal data. These cannot be disabled.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analytics',
                description:
                  'Help us understand how people use BringTheApp — which features are popular, where users get stuck. We use PostHog with privacy-friendly defaults (all inputs masked, no PII).',
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: 'Name',
                    description: 'Description',
                    duration: 'Duration',
                  },
                  body: [
                    {
                      name: 'PostHog',
                      description: 'Product analytics — page views, feature usage, session replays (inputs masked).',
                      duration: '1 year',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });
}

/**
 * Check if user has accepted analytics cookies.
 */
export function analyticsAccepted() {
  return CookieConsent.acceptedCategory('analytics');
}

/**
 * Listen for consent changes (user toggles preferences after initial choice).
 */
export function onConsentChange(callback) {
  window.addEventListener('cc:onChange', callback);
}
