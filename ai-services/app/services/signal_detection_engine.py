from __future__ import annotations
from typing import Optional
from app.schemas.insights import SignalDetectionRequest, SignalDetectionResponse, DetectedSignal


class SignalDetectionEngineService:
    def _volume_spike_signal(self, payload: SignalDetectionRequest) -> Optional[DetectedSignal]:
        current_volume = payload.volume_data.get('current_volume', 0)
        average_volume = payload.volume_data.get('average_volume', 1)
        if average_volume <= 0:
            average_volume = 1
        ratio = current_volume / average_volume
        if ratio < 1.5:
            return None

        score = min(100, round(45 + (ratio - 1) * 22))
        reason = f'Unusual volume detected: current volume is {ratio:.2f}x the average traded volume.'
        return DetectedSignal(signal_type='unusual_volume_spike', score=score, reason=reason)

    def _earnings_surprise_signal(self, payload: SignalDetectionRequest) -> Optional[DetectedSignal]:
        earnings_expected = payload.price_data.get('earnings_expected')
        earnings_actual = payload.price_data.get('earnings_actual')
        if earnings_expected in (None, 0) or earnings_actual is None:
            return None

        surprise_pct = ((earnings_actual - earnings_expected) / abs(earnings_expected)) * 100
        filing_boost = sum(1 for filing in payload.corporate_filings if filing.event_type == 'earnings' and filing.sentiment == 'positive')
        if abs(surprise_pct) < 5:
            return None

        base = 55 + min(25, abs(surprise_pct) * 1.2) + (filing_boost * 4)
        score = max(0, min(100, round(base)))
        reason = f'Earnings surprise detected at {surprise_pct:.2f}% versus expected performance.'
        return DetectedSignal(signal_type='earnings_surprise', score=score, reason=reason)

    def _insider_buying_signal(self, payload: SignalDetectionRequest) -> Optional[DetectedSignal]:
        total_buy_qty = sum(trade.quantity for trade in payload.insider_trades if trade.type == 'buy')
        total_sell_qty = sum(trade.quantity for trade in payload.insider_trades if trade.type == 'sell')
        if total_buy_qty <= total_sell_qty or total_buy_qty == 0:
            return None

        ratio = total_buy_qty / max(1, total_sell_qty)
        filing_alignment = sum(1 for filing in payload.corporate_filings if filing.event_type == 'insider_trades' and filing.sentiment == 'positive')
        score = min(100, round(50 + min(30, ratio * 8) + (filing_alignment * 5)))
        reason = f'Insider buying trend detected with buy quantity {total_buy_qty:.0f} versus sell quantity {total_sell_qty:.0f}.'
        return DetectedSignal(signal_type='insider_buying_trend', score=score, reason=reason)

    def detect(self, payload: SignalDetectionRequest) -> SignalDetectionResponse:
        signals = []

        volume_signal = self._volume_spike_signal(payload)
        if volume_signal:
            signals.append(volume_signal)

        earnings_signal = self._earnings_surprise_signal(payload)
        if earnings_signal:
            signals.append(earnings_signal)

        insider_signal = self._insider_buying_signal(payload)
        if insider_signal:
            signals.append(insider_signal)

        return SignalDetectionResponse(company=payload.company, symbol=payload.symbol, signals=signals)


