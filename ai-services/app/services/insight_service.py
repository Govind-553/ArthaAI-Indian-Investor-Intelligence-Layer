from __future__ import annotations
from typing import Optional
from app.core.config import get_settings
from app.schemas.insights import InsightRequest, InsightResponse, SignalScoreRequest


class InsightGenerationService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _build_portfolio_summary(self, portfolio: list) -> str:
        if not portfolio:
            return 'No portfolio positions were provided.'
        return '; '.join(
            [f"{holding.symbol}: qty {holding.quantity} at avg price {holding.averagePrice}" for holding in portfolio]
        )

    def _generate_recommendation(self, question: str, portfolio: list, risk_profile: Optional[str]) -> tuple[str, str]:
        lowered_question = question.lower()
        portfolio_symbols = {holding.symbol.upper(): holding for holding in portfolio}
        recommendation = 'hold'
        risk_analysis = 'Portfolio risk appears balanced based on the currently supplied positions.'

        for symbol, holding in portfolio_symbols.items():
            if symbol.lower() in lowered_question:
                position_size = holding.quantity * holding.averagePrice
                if 'sell' in lowered_question:
                    if risk_profile == 'conservative' or position_size > 50000:
                        recommendation = f'Consider trimming {symbol} rather than fully exiting, unless thesis deterioration is confirmed.'
                        risk_analysis = f'{symbol} is material in your portfolio context, so a full exit could reduce concentration risk but may also lock in opportunity cost.'
                    else:
                        recommendation = f'A hold-with-monitoring stance on {symbol} looks more appropriate than an immediate sell.'
                        risk_analysis = f'{symbol} does not appear oversized for your stated profile, but event-driven downside and sector volatility should still be monitored.'
                else:
                    recommendation = f'Hold {symbol} while tracking earnings quality, price momentum, and any adverse filing updates.'
                    risk_analysis = f'{symbol} contributes position-specific risk through sector sensitivity and earnings execution uncertainty.'
                return recommendation, risk_analysis

        if portfolio:
            recommendation = 'Maintain current positions, rebalance only if conviction weakens or concentration rises.'
            risk_analysis = 'The main risks are concentration, event shocks, and mismatch between portfolio holdings and risk profile.'

        return recommendation, risk_analysis

    def generate(self, payload: InsightRequest) -> InsightResponse:
        context = payload.marketContext
        subject = context.sector or ', '.join(context.holdings) or 'the selected market segment'
        sentiment = context.marketSentiment or 'mixed'
        portfolio_summary = self._build_portfolio_summary(context.portfolio)
        recommendation, risk_analysis = self._generate_recommendation(payload.question, context.portfolio, context.riskProfile)

        answer = (
            f"{subject} currently shows a {sentiment} tone. "
            f"Portfolio context: {portfolio_summary}. "
            f"For the question '{payload.question}', the personalized stance is: {recommendation}"
        )

        citations = []
        if context.sector:
            citations.append(f"sector-performance:{context.sector}")
        if context.holdings:
            citations.append({'source': 'portfolio-context', 'symbols': context.holdings})
        if context.portfolio:
            citations.append({'source': 'portfolio-holdings', 'count': len(context.portfolio)})

        return InsightResponse(
            answer=answer,
            confidence=self.settings.default_confidence,
            citations=citations,
            recommendation=recommendation,
            risk_analysis=risk_analysis,
        )


class SignalScoringService:
    def score(self, payload: SignalScoreRequest) -> dict:
        base = 50
        sentiment_modifier = {'positive': 15, 'neutral': 5, 'negative': -10}.get(payload.sentiment, 0)
        size_modifier = min(int(payload.metadata.get('dealValueCrore', 0) / 20), 20)
        final_score = max(0, min(100, base + sentiment_modifier + size_modifier))
        return {
            'symbol': payload.symbol,
            'signalScore': final_score,
            'rationale': 'Score blends sentiment, event intensity, and disclosed transaction value.',
        }


