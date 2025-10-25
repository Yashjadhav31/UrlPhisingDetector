import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Globe, Calendar, Search, Loader2 } from 'lucide-react';

interface AnalysisResult {
  url: string;
  is_safe: boolean;
  risk_level: string;
  threat_score: number;
  domain_age: string | null;
  domain_created: string | null;
  suspicious_patterns: string[];
  security_checks: Record<string, boolean>;
  recommendations: string[];
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const analyzeUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze URL. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-blue-600';
      case 'SAFE': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-300';
      case 'LOW': return 'bg-blue-100 border-blue-300';
      case 'SAFE': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'MEDIUM': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'LOW': return <AlertTriangle className="w-6 h-6 text-blue-600" />;
      case 'SAFE': return <CheckCircle className="w-6 h-6 text-green-600" />;
      default: return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">URL Phishing Detector</h1>
              <p className="text-blue-100">Advanced security analysis for suspicious URLs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* URL Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Enter URL for Analysis
          </h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or suspicious-url.com"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
            />
            <button
              onClick={analyzeUrl}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Analyzing...' : 'Analyze URL'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className={`rounded-xl shadow-lg p-6 border-2 ${getRiskBgColor(result.risk_level)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getRiskIcon(result.risk_level)}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Risk Assessment</h3>
                    <p className="text-gray-600">Overall threat evaluation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRiskColor(result.risk_level)}`}>
                    {result.risk_level}
                  </div>
                  <div className="text-sm text-gray-600">
                    Threat Score: {result.threat_score}/100
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.threat_score >= 70 ? 'bg-red-500' :
                    result.threat_score >= 40 ? 'bg-yellow-500' :
                    result.threat_score >= 20 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${result.threat_score}%` }}
                ></div>
              </div>
            </div>

            {/* URL Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                URL Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Analyzed URL</h4>
                  <div className="p-3 bg-gray-50 rounded-lg break-all text-sm">
                    {result.url}
                  </div>
                </div>
                
                {result.domain_created && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Domain Registration
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm">Created: {result.domain_created}</div>
                      <div className="text-sm text-gray-600">Age: {result.domain_age}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Checks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Checks</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(result.security_checks).map(([check, passed]) => (
                  <div key={check} className="flex items-center gap-3">
                    {passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm capitalize">
                      {check.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Patterns */}
            {result.suspicious_patterns.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Suspicious Patterns Detected
                </h3>
                
                <div className="space-y-2">
                  {result.suspicious_patterns.map((pattern, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Recommendations</h3>
              
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">{recommendation.split(' ')[0]}</div>
                    <span className="text-sm text-gray-700">
                      {recommendation.split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">URL Analysis</h4>
                <p className="text-sm text-gray-600">Deep analysis of URL structure and patterns</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Domain Check</h4>
                <p className="text-sm text-gray-600">WHOIS lookup and domain age verification</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Security Report</h4>
                <p className="text-sm text-gray-600">Comprehensive threat assessment and recommendations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;