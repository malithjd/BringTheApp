import { useState, useCallback, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import FormView from './pages/FormView';
import ResultsView from './pages/ResultsView';
import { initAnalytics, trackDealAnalyzed, trackStartOver } from './lib/analytics';
import { initCookieConsent, analyticsAccepted, onConsentChange } from './lib/cookieconsent';

/**
 * Update the browser history so the back button works naturally.
 * - replace=true when initial page-load or replacing current entry
 * - replace=false (default) pushes a new entry (normal forward navigation)
 */
function syncHistory(view, replace = false) {
  const state = { view };
  if (replace) {
    window.history.replaceState(state, '', window.location.pathname);
  } else {
    window.history.pushState(state, '', window.location.pathname);
  }
}

function App() {
  const [view, setView] = useState('landing');

  const [dealData, setDealData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formKey, setFormKey] = useState(0);

  // Cookie consent → conditionally init analytics
  useEffect(() => {
    initCookieConsent().then(() => {
      if (analyticsAccepted()) initAnalytics();
    });
    onConsentChange(() => {
      if (analyticsAccepted()) initAnalytics();
    });
  }, []);

  // Set the initial history entry so popstate has something to land on
  useEffect(() => {
    syncHistory('landing', true);

    const onPopState = (e) => {
      const targetView = e.state?.view || 'landing';
      setView(targetView);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goTo = useCallback((nextView) => {
    setView(nextView);
    syncHistory(nextView);
    window.scrollTo(0, 0);
  }, []);

  const handleAnalysisComplete = (inputData, result) => {
    setDealData(inputData);
    setAnalysisResult(result);
    goTo('results');
    trackDealAnalyzed(result);
  };

  // "Start Over" — keeps the landing separate; clears the deal and
  // sends user back to the upload/form screen to begin a new analysis.
  const handleStartOver = useCallback(() => {
    trackStartOver(view);
    setDealData(null);
    setAnalysisResult(null);
    setFormKey(k => k + 1); // remount FormView so it resets to upload mode
    goTo('form');
  }, [view, goTo]);

  // Logo click — always sends user to the landing page (home)
  const handleGoHome = useCallback(() => {
    goTo('landing');
  }, [goTo]);

  const handleEditDeal = useCallback(() => {
    goTo('form');
  }, [goTo]);

  const handleGetStarted = useCallback(() => {
    goTo('form');
  }, [goTo]);

  return (
    <div className="min-h-dvh bg-bg grain">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 sticky top-0 bg-bg/95 backdrop-blur-sm z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="text-lg font-semibold text-text tracking-tight hover:text-accent transition-colors cursor-pointer"
            aria-label="Go to home page"
          >
            BringTheApp
          </button>
          {view !== 'landing' && (
            <div className="flex items-center gap-3">
              {view === 'results' && (
                <button
                  onClick={handleEditDeal}
                  className="text-sm text-text2 hover:text-text transition-colors"
                >
                  Edit Deal
                </button>
              )}
              <button
                onClick={handleStartOver}
                className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Start Over
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === 'landing' ? (
          <LandingPage onGetStarted={handleGetStarted} />
        ) : view === 'form' ? (
          <FormView
            key={formKey}
            initialData={dealData}
            onAnalysisComplete={handleAnalysisComplete}
          />
        ) : (
          <ResultsView
            dealData={dealData}
            result={analysisResult}
            onEditDeal={handleEditDeal}
            onNewDeal={handleStartOver}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-5 px-4">
        <div className="max-w-3xl mx-auto text-center text-xs text-text2">
          Built by{' '}
          <a
            href="https://malithjd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            malithjd.com
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
