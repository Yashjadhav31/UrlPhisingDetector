import React from 'react';
import { Shield, ShieldAlert, ShieldX, ChevronDown, ChevronUp, Globe, Lock, AlertTriangle } from 'lucide-react';
import { URLAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: URLAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const getStatusIcon = () => {
    if (analysis.isSafe) {
      return <Shield className="h-8 w-8 text-green-600" />;
    } else if (analysis.riskLevel === 'medium') {
      return <ShieldAlert className="h-8 w-8 text-yellow-600" />;
    } else {
      return <ShieldX className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (analysis.isSafe) return 'green';
    if (analysis.riskLevel === 'medium') return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    if (analysis.isSafe) return 'Safe to Visit';
    if (analysis.riskLevel === 'medium') return 'Proceed with Caution';
    return 'Dangerous - Do Not Visit';
  };

  const getScoreColor = () => {
    if (analysis.score >= 80) return 'text-green-600';
    if (analysis.score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const statusColor = getStatusColor();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`bg-white rounded-xl shadow-lg border-2 ${
        statusColor === 'green' ? 'border-green-200' : 
        statusColor === 'yellow' ? 'border-yellow-200' : 'border-red-200'
      } overflow-hidden transition-all duration-300 hover:shadow-xl`}>
        
        {/* Main Result */}
        <div className={`p-6 ${
          statusColor === 'green' ? 'bg-gradient-to-r from-green-50 to-green-100' : 
          statusColor === 'yellow' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 
          'bg-gradient-to-r from-red-50 to-red-100'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon()}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {getStatusText()}
                </h3>
                <p className="text-gray-600 break-all">
                  {analysis.url}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor()}`}>
                {analysis.score}/100
              </div>
              <div className="text-sm text-gray-500">Safety Score</div>
            </div>
          </div>

          {analysis.threats.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Detected Threats
              </h4>
              <ul className="space-y-1">
                {analysis.threats.map((threat, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {threat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-gray-700 font-medium"
        >
          <span>Technical Details</span>
          {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {/* Expandable Details */}
        {showDetails && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">URL Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Domain:</span>
                    <span className="text-gray-600">{analysis.details.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Protocol:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      analysis.details.protocol === 'https:' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {analysis.details.protocol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Certificate:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      analysis.details.certificateStatus === 'Secure' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {analysis.details.certificateStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-3">Risk Factors</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Uses IP Address:</span>
                    <span className={analysis.details.hasIP ? 'text-red-600' : 'text-green-600'}>
                      {analysis.details.hasIP ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>URL Shortener:</span>
                    <span className={analysis.details.isShortener ? 'text-red-600' : 'text-green-600'}>
                      {analysis.details.isShortener ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Homograph Attack:</span>
                    <span className={analysis.details.homographAttack ? 'text-red-600' : 'text-green-600'}>
                      {analysis.details.homographAttack ? 'Detected' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysis.details.suspiciousKeywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-2">Suspicious Keywords Found</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.details.suspiciousKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Analysis completed at: {analysis.timestamp.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};