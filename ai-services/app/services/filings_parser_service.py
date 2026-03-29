from __future__ import annotations
import re
from io import BytesIO
from typing import Optional
from pypdf import PdfReader
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.schemas.insights import FilingParseResponse, FilingSignal


class CorporateFilingsParserService:
    def __init__(self) -> None:
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.event_patterns = {
            'earnings': [r'earnings', r'quarterly results', r'profit', r'revenue', r'ebitda', r'guidance'],
            'mergers': [r'merger', r'acquisition', r'amalgamation', r'takeover', r'scheme of arrangement'],
            'insider_trades': [r'insider trade', r'promoter sale', r'promoter purchase', r'sast', r'pledge', r'bulk deal'],
        }

    def extract_text_from_pdf(self, content: bytes) -> str:
        reader = PdfReader(BytesIO(content))
        pages = [page.extract_text() or '' for page in reader.pages]
        return '\n'.join(pages).strip()

    def detect_company(self, text: str) -> str:
        patterns = [
            r'company\s*[:\-]\s*([A-Z][A-Za-z0-9&.,\- ]{2,80})',
            r'([A-Z][A-Za-z0-9&.,\- ]+(?:Limited|Ltd|Industries|Bank|Technologies|Motors))',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return 'Unknown Company'

    def detect_sentiment(self, text: str) -> tuple[str, float]:
        score = self.sentiment_analyzer.polarity_scores(text).get('compound', 0.0)
        if score >= 0.2:
            return 'positive', round(min(0.99, 0.55 + abs(score) * 0.4), 2)
        if score <= -0.2:
            return 'negative', round(min(0.99, 0.55 + abs(score) * 0.4), 2)
        return 'neutral', 0.6

    def extract_signals(self, text: str) -> list[dict]:
        signals = []
        company = self.detect_company(text)
        lowered = text.lower()

        for event_type, patterns in self.event_patterns.items():
            match_count = sum(1 for pattern in patterns if re.search(pattern, lowered))
            if match_count:
                sentiment, base_confidence = self.detect_sentiment(text)
                confidence = round(min(0.99, base_confidence + (match_count * 0.08)), 2)
                signals.append(
                    FilingSignal(
                        company=company,
                        event_type=event_type,
                        sentiment=sentiment,
                        confidence=confidence,
                    ).model_dump()
                )

        return signals

    def parse_filing(self, raw_text: Optional[str] = None, file_bytes: Optional[bytes] = None, filename: Optional[str] = None) -> FilingParseResponse:
        source_type = 'text'
        parsed_text = (raw_text or '').strip()

        if file_bytes:
            source_type = 'pdf' if (filename or '').lower().endswith('.pdf') else 'file'
            parsed_text = self.extract_text_from_pdf(file_bytes) if source_type == 'pdf' else file_bytes.decode('utf-8', errors='ignore')

        company = self.detect_company(parsed_text)
        signals = self.extract_signals(parsed_text)

        return FilingParseResponse(
            company=company,
            signals=signals,
            source_type=source_type,
        )


