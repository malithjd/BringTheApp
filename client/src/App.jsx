import { useState, useCallback, useEffect } from 'react';
import FormView from './pages/FormView';
import ResultsView from './pages/ResultsView';
import { initAnalytics, trackDealAnalyzed, trackStartOver } from './lib/analytics';

function App() {
  const [view, setView] = useState('form'); // 'form' | 'results'

  // Initialize analytics once on mount
  useEffect(() => { initAnalytics(); }, []);
  const [dealData, setDealData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formKey, setFormKey] = useState(0); // forces FormView remount on Start Over

  const handleAnalysisComplete = (inputData, result) => {
    setDealData(inputData);
    setAnalysisResult(result);
    setView('results');
    window.scrollTo(0, 0);
    trackDealAnalyzed(result);
  };

  const handleEditDeal = () => {
    setView('form');
    window.scrollTo(0, 0);
  };

  const handleNewDeal = useCallback(() => {
    trackStartOver(view);
    setDealData(null);
    setAnalysisResult(null);
    setFormKey(k => k + 1); // remount FormView so it resets to upload mode
    setView('form');
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 sticky top-0 bg-bg/95 backdrop-blur-sm z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleNewDeal}
            className="text-lg font-semibold text-text tracking-tight hover:text-accent transition-colors cursor-pointer"
          >
            BringTheApp
          </button>
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
              onClick={handleNewDeal}
              className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Start Over
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === 'form' ? (
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
            onNewDeal={handleNewDeal}
          />
        )}
      </main>
    </div>
  );
}

export default App;
