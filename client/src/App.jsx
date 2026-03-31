import { useState } from 'react';
import FormView from './pages/FormView';
import ResultsView from './pages/ResultsView';

function App() {
  const [view, setView] = useState('form'); // 'form' | 'results'
  const [dealData, setDealData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisComplete = (inputData, result) => {
    setDealData(inputData);
    setAnalysisResult(result);
    setView('results');
    window.scrollTo(0, 0);
  };

  const handleEditDeal = () => {
    setView('form');
    window.scrollTo(0, 0);
  };

  const handleNewDeal = () => {
    setDealData(null);
    setAnalysisResult(null);
    setView('form');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleNewDeal}
            className="text-lg font-semibold text-text tracking-tight"
          >
            BringTheApp
          </button>
          {view === 'results' && (
            <button
              onClick={handleEditDeal}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Edit Deal
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {view === 'form' ? (
          <FormView
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
