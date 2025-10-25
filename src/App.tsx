import React, { useState } from 'react';
import { URLInput } from './components/URLInput';
import { AnalysisResult } from './components/AnalysisResult';
import { AnalysisHistoryComponent } from './components/AnalysisHistory';
import { PhishingDetector } from './utils/phishingDetector';
import { useLocalStorage } from './hooks/useLocalStorage';
import { URLAnalysis, AnalysisHistory } from './types';
import { Shield } from 'lucide-react';

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<URLAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useLocalStorage<AnalysisHistory[]>('phishing-detector-history', []);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis = PhishingDetector.analyzeURL(url);
    setCurrentAnalysis(analysis);
    
    // Add to history
    const historyItem: AnalysisHistory = {
      id: Date.now().toString(),
      analysis
    };
    
    setHistory(prevHistory => [historyItem, ...prevHistory.slice(0, 19)]); // Keep last 20 items
    setIsAnalyzing(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSelectAnalysis = (historyItem: AnalysisHistory) => {
    setCurrentAnalysis(historyItem.analysis);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <URLInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        
        {currentAnalysis && (
          <div className="mb-8">
            <AnalysisResult analysis={currentAnalysis} />
          </div>
        )}
        
        <AnalysisHistoryComponent
          history={history}
          onClearHistory={handleClearHistory}
          onSelectAnalysis={handleSelectAnalysis}
        />
        
        {!currentAnalysis && !isAnalyzing && (
          <div className="text-center mt-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Stay Safe Online
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced phishing detection system analyzes URLs for suspicious patterns, 
                  malicious domains, and security threats. Enter any URL above to get a 
                  comprehensive security assessment and protect yourself from online scams.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Instant security assessment of any URL
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Advanced Detection</h3>
                    <p className="text-sm text-gray-600">
                      Multiple algorithms detect various threats
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">History Tracking</h3>
                    <p className="text-sm text-gray-600">
                      Keep track of analyzed URLs locally
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;