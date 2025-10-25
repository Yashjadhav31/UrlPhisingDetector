from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import socket
from datetime import datetime
from urllib.parse import urlparse
from typing import Dict, List, Optional
import whois

app = FastAPI(title="URL Phishing Detector API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

class AnalysisResult(BaseModel):
    url: str
    is_safe: bool
    risk_level: str
    threat_score: int
    domain_age: Optional[str]
    domain_created: Optional[str]
    suspicious_patterns: List[str]
    security_checks: Dict[str, bool]
    recommendations: List[str]

def normalize_url(url: str) -> str:
    """Normalize URL by adding protocol if missing"""
    if not url.startswith(('http://', 'https://')):
        return f'https://{url}'
    return url

def extract_domain(url: str) -> str:
    """Extract domain from URL"""
    try:
        parsed = urlparse(normalize_url(url))
        return parsed.netloc.lower()
    except:
        return url.lower()

def check_suspicious_characters(domain: str) -> List[str]:
    """Check for suspicious characters and patterns in domain"""
    suspicious_patterns = []
    
    # Check for homograph attacks (lookalike characters)
    suspicious_chars = ['а', 'е', 'о', 'р', 'с', 'х', 'у', 'ѕ', 'ο', 'е']
    if any(char in domain for char in suspicious_chars):
        suspicious_patterns.append("Homograph attack: Contains lookalike characters")
    
    # Check for excessive hyphens
    if domain.count('-') > 3:
        suspicious_patterns.append("Excessive hyphens in domain name")
    
    # Check for suspicious subdomains
    if domain.count('.') > 3:
        suspicious_patterns.append("Suspicious number of subdomains")
    
    # Check for common phishing patterns
    phishing_keywords = ['secure', 'verify', 'update', 'confirm', 'account', 'bank', 'paypal', 'amazon', 'microsoft', 'google', 'apple']
    domain_parts = domain.replace('-', '').replace('.', '')
    if any(keyword in domain_parts for keyword in phishing_keywords):
        suspicious_patterns.append("Contains common phishing keywords")
    
    # Check for punycode (internationalized domain names)
    if 'xn--' in domain:
        suspicious_patterns.append("Uses punycode (internationalized domain)")
    
    # Check for URL shorteners
    shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'short.link', 'ow.ly']
    if any(shortener in domain for shortener in shorteners):
        suspicious_patterns.append("URL shortener detected")
    
    return suspicious_patterns

def check_domain_age(domain: str) -> tuple:
    """Check domain registration date and age using WHOIS lookup"""
    try:
        w = whois.whois(domain)
        
        # Handle cases where creation_date might be a list
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        
        if creation_date and isinstance(creation_date, datetime):
            today = datetime.now()
            age_in_days = (today - creation_date).days
            domain_age_str = f"{age_in_days} days"
            domain_created_str = creation_date.strftime("%Y-%m-%d")
            return domain_created_str, domain_age_str
            
    except Exception as e:
        print(f"WHOIS lookup failed for {domain}: {e}")

    return None, None

def calculate_threat_score(domain: str, suspicious_patterns: List[str], domain_age: Optional[str]) -> tuple:
    """Calculate threat score and risk level"""
    score = 0
    
    # Base score for suspicious patterns
    score += len(suspicious_patterns) * 15
    
    # Domain age factor
    if domain_age:
        age_days = int(domain_age.split()[0]) if domain_age else 0
        if age_days < 30:
            score += 25
        elif age_days < 90:
            score += 15
        elif age_days < 365:
            score += 10
    else:
        score += 20  # Unknown age is suspicious
    
    # Domain length factor
    if len(domain) > 20:
        score += 10
    
    # Determine risk level
    if score >= 70:
        risk_level = "HIGH"
    elif score >= 40:
        risk_level = "MEDIUM"
    elif score >= 20:
        risk_level = "LOW"
    else:
        risk_level = "SAFE"
    
    return min(score, 100), risk_level

def perform_security_checks(domain: str, url: str) -> Dict[str, bool]:
    """Perform various security checks"""
    checks = {}
    
    # HTTPS check
    checks['https_enabled'] = url.startswith('https://')
    
    # Domain resolution check
    try:
        socket.gethostbyname(domain)
        checks['domain_resolves'] = True
    except:
        checks['domain_resolves'] = False
    
    # Check if domain contains IP address
    ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
    checks['not_ip_address'] = not re.match(ip_pattern, domain)
    
    # Check for suspicious TLD
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.loan']
    checks['safe_tld'] = not any(domain.endswith(tld) for tld in suspicious_tlds)
    
    return checks

def generate_recommendations(risk_level: str, suspicious_patterns: List[str], security_checks: Dict[str, bool]) -> List[str]:
    """Generate security recommendations"""
    recommendations = []
    
    if risk_level in ['HIGH', 'MEDIUM']:
        recommendations.append("⚠️ Exercise extreme caution with this URL")
        recommendations.append("🔍 Verify the URL sender through alternative communication")
        recommendations.append("🚫 Do not enter personal information or login credentials")
    
    if not security_checks.get('https_enabled', True):
        recommendations.append("🔒 This site does not use HTTPS encryption")
    
    if not security_checks.get('domain_resolves', True):
        recommendations.append("🌐 Domain does not resolve properly")
    
    if not security_checks.get('not_ip_address', True):
        recommendations.append("📍 URL uses IP address instead of domain name")
    
    if suspicious_patterns:
        recommendations.append("🎭 Domain contains suspicious patterns")
    
    if risk_level == 'SAFE':
        recommendations.append("✅ URL appears to be legitimate")
        recommendations.append("🔍 Still verify the source if unexpected")
    
    return recommendations

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_url(request: URLRequest):
    try:
        url = normalize_url(request.url.strip())
        domain = extract_domain(url)
        
        # Perform analysis
        suspicious_patterns = check_suspicious_characters(domain)
        domain_created, domain_age = check_domain_age(domain)
        threat_score, risk_level = calculate_threat_score(domain, suspicious_patterns, domain_age)
        security_checks = perform_security_checks(domain, url)
        recommendations = generate_recommendations(risk_level, suspicious_patterns, security_checks)
        
        return AnalysisResult(
            url=url,
            is_safe=risk_level == 'SAFE',
            risk_level=risk_level,
            threat_score=threat_score,
            domain_age=domain_age,
            domain_created=domain_created,
            suspicious_patterns=suspicious_patterns,
            security_checks=security_checks,
            recommendations=recommendations
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "URL Phishing Detector API", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)