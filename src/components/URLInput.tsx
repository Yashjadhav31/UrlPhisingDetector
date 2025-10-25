import React, { useState } from 'react';
import { Search, Shield } from 'lucide-react';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export const URLInput: React.FC<URLInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">
            ROSP URL Phishing Detector
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Protect yourself from malicious websites. Enter any URL to check if it's safe to visit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center p-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL to analyze (e.g., https://example.com)"
                  className="w-full px-6 py-4 text-lg border-none outline-none bg-transparent placeholder-gray-400"
                  disabled={isAnalyzing}
                />
              </div>
              <button
                type="submit"
                disabled={!url.trim() || isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyze URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};