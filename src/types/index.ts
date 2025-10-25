export interface URLAnalysis {
  url: string;
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  threats: string[];
  details: {
    domain: string;
    protocol: string;
    hasIP: boolean;
    isShortener: boolean;
    suspiciousKeywords: string[];
    homographAttack: boolean;
    certificateStatus: string;
  };
  timestamp: Date;
}

export interface AnalysisHistory {
  id: string;
  analysis: URLAnalysis;
}