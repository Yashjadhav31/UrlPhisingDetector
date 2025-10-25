import React from 'react';
import { History, Trash2, Shield, ShieldAlert, ShieldX } from 'lucide-react';
import { AnalysisHistory } from '../types';

interface AnalysisHistoryProps {
  history: AnalysisHistory[];
  onClearHistory: () => void;
  onSelectAnalysis: (analysis: AnalysisHistory) => void;
}

export const AnalysisHistoryComponent: React.FC<AnalysisHistoryProps> = ({
  history,
  onClearHistory,
  onSelectAnalysis
}) => {
  if (history.length === 0) {
    return null;
  }

  const getStatusIcon = (isSafe: boolean, riskLevel: string) => {
    if (isSafe) {
      return <Shield className="h-4 w-4 text-green-600" />;
    } else if (riskLevel === 'medium') {
      return <ShieldAlert className="h-4 w-4 text-yellow-600" />;
    } else {
      return <ShieldX className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Analysis History</h3>
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item)}
              className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(item.analysis.isSafe, item.analysis.riskLevel)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.analysis.url}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.analysis.isSafe 
                          ? 'bg-green-100 text-green-800' 
                          : item.analysis.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.analysis.isSafe ? 'Safe' : item.analysis.riskLevel === 'medium' ? 'Caution' : 'Dangerous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {item.analysis.score}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.analysis.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};