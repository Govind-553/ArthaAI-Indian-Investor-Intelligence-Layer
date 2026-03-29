from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Any, Optional, Dict


class PortfolioHolding(BaseModel):
    symbol: str
    quantity: float
    averagePrice: float


class MarketContext(BaseModel):
    sector: Optional[str] = None
    marketSentiment: Optional[str] = None
    holdings: list[str] = Field(default_factory=list)
    riskProfile: Optional[str] = None
    portfolio: list[PortfolioHolding] = Field(default_factory=list)


class InsightRequest(BaseModel):
    question: str = Field(min_length=5, max_length=500)
    marketContext: MarketContext = Field(default_factory=MarketContext)


class InsightResponse(BaseModel):
    answer: str
    confidence: str
    citations: list[Any] = Field(default_factory=list)
    recommendation: Optional[str] = None
    risk_analysis: Optional[str] = None


class SignalScoreRequest(BaseModel):
    symbol: str
    eventType: str
    sentiment: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class IngestionTriggerRequest(BaseModel):
    symbols: list[str] = Field(default_factory=lambda: ['RELIANCE', 'TCS', 'INFY'])
    market: str = 'NSE'


class NormalizedMarketData(BaseModel):
    symbol: str
    market: str
    price: float
    open: float
    high: float
    low: float
    previous_close: float
    volume: int
    currency: str = 'INR'
    source: str = 'mock-nse-api'
    as_of: str


class IngestionResult(BaseModel):
    job_id: str
    status: str
    records_processed: int
    symbols: list[str]


class FilingSignal(BaseModel):
    company: str
    event_type: str
    sentiment: str
    confidence: float


class FilingParseResponse(BaseModel):
    company: str
    signals: list[FilingSignal] = Field(default_factory=list)
    source_type: str


class InsiderTradeInput(BaseModel):
    type: str
    quantity: float
    insider_role: str


class CorporateFilingInput(BaseModel):
    event_type: str
    sentiment: str
    confidence: float


class SignalDetectionRequest(BaseModel):
    company: str
    symbol: str
    price_data: dict[str, float]
    volume_data: dict[str, float]
    insider_trades: list[InsiderTradeInput] = Field(default_factory=list)
    corporate_filings: list[CorporateFilingInput] = Field(default_factory=list)


class DetectedSignal(BaseModel):
    signal_type: str
    score: int
    reason: str


class SignalDetectionResponse(BaseModel):
    company: str
    symbol: str
    signals: list[DetectedSignal] = Field(default_factory=list)


class TechnicalAnalysisCandle(BaseModel):
    open: float
    high: float
    low: float
    close: float
    volume: float


class TechnicalAnalysisRequest(BaseModel):
    symbol: str
    candles: list[TechnicalAnalysisCandle] = Field(min_length=20)


class TechnicalPattern(BaseModel):
    pattern: str
    confidence: float
    historical_success_rate: float


class TechnicalAnalysisResponse(BaseModel):
    symbol: str
    patterns: list[TechnicalPattern] = Field(default_factory=list)


class BacktestRequest(BaseModel):
    symbol: str
    candles: list[TechnicalAnalysisCandle] = Field(min_length=40)
    lookahead_period: int = Field(default=5, ge=1, le=30)
    target_return_pct: float = Field(default=2.0, gt=0)
    stop_loss_pct: float = Field(default=1.0, gt=0)


class BacktestPatternResult(BaseModel):
    pattern: str
    accuracy_pct: float
    risk_reward_ratio: float
    trades: int


class BacktestResponse(BaseModel):
    symbol: str
    results: list[BacktestPatternResult] = Field(default_factory=list)
    stored_result_id: Optional[str] = None


class RagDocumentInput(BaseModel):
    source_type: str
    symbol: Optional[str] = None
    title: str
    text: str
    published_at: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class RagIndexRequest(BaseModel):
    documents: list[RagDocumentInput] = Field(min_length=1)


class RagSource(BaseModel):
    id: str
    source_type: str
    title: str
    symbol: Optional[str] = None
    published_at: Optional[str] = None
    relevance_score: float


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=5, max_length=500)
    top_k: int = Field(default=5, ge=1, le=10)


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[RagSource] = Field(default_factory=list)


class VideoDataPoint(BaseModel):
    label: str
    value: float


class VideoGenerationRequest(BaseModel):
    title: str
    summary: str
    market_data: list[VideoDataPoint] = Field(min_length=2)
    aspect_ratio: str = '16:9'
    duration: int = Field(default=10, ge=10, le=10)
    image_url: Optional[str] = None


class VideoGenerationResponse(BaseModel):
    task_id: str
    status: str
    script: str
    chart_path: str
    video_provider: str


class VideoStatusResponse(BaseModel):
    task_id: str
    status: str
    video_url: Optional[str] = None
    provider_response: Optional[Dict[str, Any]] = None
