import { URLAnalysis } from '../types';

// Known phishing patterns and suspicious domains
const SUSPICIOUS_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link',
  'paypal-security.com', 'paypal-verification.net', 'amazon-security.com',
  'microsoft-update.net', 'google-security.org', 'facebook-security.com'
];

const SUSPICIOUS_KEYWORDS = [
  'verify', 'suspend', 'confirm', 'update', 'secure', 'account',
  'login', 'signin', 'banking', 'paypal', 'amazon', 'microsoft',
  'urgent', 'expired', 'limited', 'restricted', 'blocked'
];

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.click', '.download', '.work',
  '.men', '.top', '.club', '.loan', '.win', '.bid'
];

// Homograph attack characters (similar looking characters)
const HOMOGRAPH_MAP: { [key: string]: string[] } = {
  'a': ['α', 'а', 'ɑ'],
  'e': ['е', 'ë', 'é'],
  'o': ['о', '0', 'ο'],
  'i': ['і', 'ı', '1', 'l'],
  'u': ['υ', 'μ'],
  'p': ['р', 'ρ'],
  'c': ['с', 'ϲ'],
  'x': ['х', 'χ'],
  'y': ['у', 'ү'],
  'h': ['һ', 'հ']
};

export class PhishingDetector {
  static analyzeURL(inputUrl: string): URLAnalysis {
    let url: URL;
    let normalizedUrl = inputUrl.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = 'http://' + normalizedUrl;
    }

    try {
      url = new URL(normalizedUrl);
    } catch (error) {
      return {
        url: inputUrl,
        isSafe: false,
        riskLevel: 'high',
        score: 0,
        threats: ['Invalid URL format'],
        details: {
          domain: 'Invalid',
          protocol: 'Unknown',
          hasIP: false,
          isShortener: false,
          suspiciousKeywords: [],
          homographAttack: false,
          certificateStatus: 'Unknown'
        },
        timestamp: new Date()
      };
    }

    const analysis = this.performAnalysis(url, inputUrl);
    return analysis;
  }

  private static performAnalysis(url: URL, originalUrl: string): URLAnalysis {
    let score = 100;
    const threats: string[] = [];
    const suspiciousKeywords: string[] = [];

    // Check for IP address instead of domain
    const hasIP = this.isIPAddress(url.hostname);
    if (hasIP) {
      score -= 30;
      threats.push('Uses IP address instead of domain name');
    }

    // Check for suspicious domains
    const isShortener = SUSPICIOUS_DOMAINS.some(domain => 
      url.hostname.includes(domain)
    );
    if (isShortener) {
      score -= 25;
      threats.push('Uses URL shortening service');
    }

    // Check for suspicious TLDs
    const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => 
      url.hostname.endsWith(tld)
    );
    if (hasSuspiciousTLD) {
      score -= 20;
      threats.push('Uses suspicious top-level domain');
    }

    // Check for suspicious keywords
    const fullUrl = url.toString().toLowerCase();
    SUSPICIOUS_KEYWORDS.forEach(keyword => {
      if (fullUrl.includes(keyword)) {
        suspiciousKeywords.push(keyword);
        score -= 10;
      }
    });

    if (suspiciousKeywords.length > 0) {
      threats.push(`Contains suspicious keywords: ${suspiciousKeywords.join(', ')}`);
    }

    // Check for homograph attacks
    const homographAttack = this.checkHomographAttack(url.hostname);
    if (homographAttack) {
      score -= 25;
      threats.push('Potential homograph attack (look-alike characters)');
    }

    // Check URL length (very long URLs are suspicious)
    if (url.toString().length > 200) {
      score -= 15;
      threats.push('Unusually long URL');
    }

    // Check for multiple subdomains
    const subdomains = url.hostname.split('.').length - 2;
    if (subdomains > 2) {
      score -= 10;
      threats.push('Multiple subdomains detected');
    }

    // Check for HTTPS
    if (url.protocol !== 'https:') {
      score -= 10;
      threats.push('Does not use secure HTTPS protocol');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 80) riskLevel = 'low';
    else if (score >= 50) riskLevel = 'medium';
    else riskLevel = 'high';

    const isSafe = score >= 70;

    return {
      url: originalUrl,
      isSafe,
      riskLevel,
      score: Math.max(0, score),
      threats,
      details: {
        domain: url.hostname,
        protocol: url.protocol,
        hasIP,
        isShortener,
        suspiciousKeywords,
        homographAttack,
        certificateStatus: url.protocol === 'https:' ? 'Secure' : 'Insecure'
      },
      timestamp: new Date()
    };
  }

  private static isIPAddress(hostname: string): boolean {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^[0-9a-fA-F:]+$/;
    return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
  }

  private static checkHomographAttack(hostname: string): boolean {
    for (const char of hostname.toLowerCase()) {
      for (const [normalChar, variants] of Object.entries(HOMOGRAPH_MAP)) {
        if (variants.includes(char)) {
          return true;
        }
      }
    }
    return false;
  }
}