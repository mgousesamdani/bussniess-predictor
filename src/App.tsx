import React, { useState } from 'react';
import BusinessForm from './components/BusinessForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import { BusinessInput, BusinessPrediction } from './types';
import { predictBusiness } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<BusinessPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<BusinessInput | null>(null);
  const [previousIdeas, setPreviousIdeas] = useState<string[]>([]);

  const handlePredict = async (input: BusinessInput) => {
    setIsLoading(true);
    setError(null);
    setLastInput(input);
    setPreviousIdeas([]);
    try {
      const result = await predictBusiness(input);
      setPrediction(result);
      if (result.businessName) {
        setPreviousIdeas([result.businessName]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to analyze market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextIdea = async () => {
    if (!lastInput) return;
    setIsLoading(true);
    try {
      const result = await predictBusiness(lastInput, previousIdeas);
      setPrediction(result);
      if (result.businessName) {
        setPreviousIdeas(prev => [...prev, result.businessName]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to find another idea. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPrediction(null);
    setError(null);
    setLastInput(null);
    setPreviousIdeas([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-black text-xl tracking-tight text-white">Business <span className="text-indigo-400">Predictor</span></span>
          </div>
          
          {prediction && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft size={16} />
              New Prediction
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!prediction ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-5xl font-black text-white leading-tight">
                  Predict Your Future <br />
                  <span className="text-indigo-400">Business Success in India</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  Leverage AI and historical market data to make informed, data-driven decisions before you invest your hard-earned capital.
                </p>
              </div>

              <BusinessForm onSubmit={handlePredict} isLoading={isLoading} />
              
              {error && (
                <div className="max-w-2xl mx-auto bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-xl text-center font-medium">
                  {error}
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-8 opacity-20 grayscale invert pt-8">
                <div className="flex items-center gap-2 font-bold">DATA DRIVEN</div>
                <div className="flex items-center gap-2 font-bold">REGIONAL ANALYSIS</div>
                <div className="flex items-center gap-2 font-bold">RISK ASSESSMENT</div>
                <div className="flex items-center gap-2 font-bold">REAL-TIME INSIGHTS</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnalysisDashboard 
                prediction={prediction} 
                onNextIdea={handleNextIdea}
                isLoadingNext={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Business Predictor. AI-powered business intelligence for India.
        </div>
      </footer>
    </div>
  );
}
