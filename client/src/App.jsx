import { useState, useCallback, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import FormView from './pages/FormView';
import ResultsView from './pages/ResultsView';
import CompareView from './pages/CompareView';
import AccountPage from './pages/AccountPage';
import AuthModal from './components/AuthModal';
import SavedReports from './components/SavedReports';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import { fetchReports } from './lib/reports';
import { initAnalytics, trackDealAnalyzed, trackStartOver } from './lib/analytics';
import { initCookieConsent, analyticsAccepted, onConsentChange } from './lib/cookieconsent';

const PATH_TO_VIEW = {
  '/': 'landing',
  '/analyze': 'form',
  '/results': 'results',
  '/compare': 'compare',
  '/account': 'account',
};
const VIEW_TO_PATH = Object.fromEntries(Object.entries(PATH_TO_VIEW).map(([p, v]) => [v, p]));

function pathToView(pathname) {
  return PATH_TO_VIEW[pathname] ?? 'landing';
}

function syncHistory(view, replace = false) {
  const path = VIEW_TO_PATH[view] ?? '/';
  const state = { view };
  if (replace) {
    window.history.replaceState(state, '', path);
  } else {
    window.history.pushState(state, '', path);
  }
}

function AppInner() {
  const { user, signOut, passwordRecovery } = useAuth();
  const [view, setView] = useState(() => pathToView(window.location.pathname));
  const [dealData, setDealData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const [showAuth, setShowAuth] = useState(false);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [compareReports, setCompareReports] = useState(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!user) { setSavedCount(0); return; }
    fetchReports().then(r => setSavedCount(r.length)).catch(() => {});
  }, [user]);

  useEffect(() => {
    initCookieConsent().then(() => {
      if (analyticsAccepted()) initAnalytics();
    });
    onConsentChange(() => {
      if (analyticsAccepted()) initAnalytics();
    });
  }, []);

  // Seed history state on mount and listen for back/forward
  useEffect(() => {
    const currentView = pathToView(window.location.pathname);
    window.history.replaceState({ view: currentView }, '', window.location.pathname);
    const onPopState = (e) => {
      const targetView = e.state?.view || pathToView(window.location.pathname);
      setView(targetView);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // If Supabase sends a password recovery token, redirect to /account
  useEffect(() => {
    if (passwordRecovery) goTo('account');
  }, [passwordRecovery]);

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

  const handleStartOver = useCallback(() => {
    trackStartOver(view);
    setDealData(null);
    setAnalysisResult(null);
    setFormKey(k => k + 1);
    goTo('form');
  }, [view, goTo]);

  const handleGoHome = useCallback(() => goTo('landing'), [goTo]);
  const handleEditDeal = useCallback(() => goTo('form'), [goTo]);
  const handleGetStarted = useCallback(() => goTo('form'), [goTo]);

  const handleSaveReport = useCallback((action) => {
    if (action === 'auth') { setShowAuth(true); return; }
    if (action === 'limit') { setShowSavedReports(true); return; }
    if (action === 'saved') { setSavedCount(n => n + 1); }
  }, []);

  const handleLoadReport = useCallback((report) => {
    setDealData(report.deal_data);
    setAnalysisResult(report.result);
    goTo('results');
  }, [goTo]);

  const handleCompare = useCallback((a, b) => {
    setCompareReports({ a, b });
    goTo('compare');
  }, [goTo]);

  const isCompare = view === 'compare';
  const isResults = view === 'results';
  const isLanding = view === 'landing';
  const isAccount = view === 'account';

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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saved reports */}
            {user && (
              <button
                onClick={() => setShowSavedReports(true)}
                className="flex items-center gap-1.5 text-sm text-text2 hover:text-text transition-colors"
                title="Saved reports"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span className="hidden sm:inline">Reports</span>
                {savedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {/* Nav actions */}
            {!isLanding && !isCompare && !isAccount && (
              <>
                {isResults && (
                  <button
                    onClick={handleEditDeal}
                    className="text-sm text-text2 hover:text-text transition-colors hidden sm:block"
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
                  <span className="hidden sm:inline">Start Over</span>
                </button>
              </>
            )}

            {/* Auth controls */}
            {user === null && (
              <button
                onClick={() => setShowAuth(true)}
                className="px-3 py-1.5 text-sm font-medium text-text2 hover:text-text border border-border hover:border-accent/50 rounded-lg transition-colors"
              >
                Sign in
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo('account')}
                  title={`Account · ${user.email}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isAccount ? 'bg-accent text-white' : 'bg-surface2 border border-border text-text2 hover:border-accent/50 hover:text-text'}`}
                >
                  {user.email?.[0]?.toUpperCase() ?? '?'}
                </button>
                <button
                  onClick={signOut}
                  className="text-sm text-text2 hover:text-text transition-colors"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            )}
          </div>
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
        ) : view === 'compare' ? (
          <CompareView
            reportA={compareReports?.a}
            reportB={compareReports?.b}
            onBack={() => setShowSavedReports(true)}
          />
        ) : view === 'account' ? (
          <AccountPage onGoHome={handleGoHome} />
        ) : (
          <ResultsView
            dealData={dealData}
            result={analysisResult}
            onEditDeal={handleEditDeal}
            onNewDeal={handleStartOver}
            onSaveReport={handleSaveReport}
            user={user}
            savedCount={savedCount}
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

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {showSavedReports && (
        <SavedReports
          onLoad={handleLoadReport}
          onCompare={handleCompare}
          onClose={() => setShowSavedReports(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
