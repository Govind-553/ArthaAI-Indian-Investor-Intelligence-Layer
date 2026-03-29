from __future__ import annotations
from typing import Optional
import pandas as pd
import numpy as np
from app.schemas.insights import TechnicalAnalysisRequest, TechnicalAnalysisResponse, TechnicalPattern


class TechnicalAnalysisEngineService:
    def to_dataframe(self, payload: TechnicalAnalysisRequest) -> pd.DataFrame:
        frame = pd.DataFrame([candle.model_dump() if hasattr(candle, 'model_dump') else candle.__dict__ for candle in payload.candles])
        frame['open'] = frame['open'].astype(float)
        frame['high'] = frame['high'].astype(float)
        frame['low'] = frame['low'].astype(float)
        frame['close'] = frame['close'].astype(float)
        frame['volume'] = frame['volume'].astype(float)
        return frame

    def _calculate_rsi(self, close: pd.Series, period: int = 14) -> pd.Series:
        delta = close.diff()
        gains = delta.clip(lower=0)
        losses = -delta.clip(upper=0)

        avg_gain = gains.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
        avg_loss = losses.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
        relative_strength = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + relative_strength))

        # Treat zero-loss windows as maximum RSI instead of NaN.
        rsi = rsi.where(~avg_loss.eq(0), 100)
        return rsi

    def detect_breakout(self, frame: pd.DataFrame) -> Optional[TechnicalPattern]:
        recent_close = frame['close'].iloc[-1]
        recent_volume = frame['volume'].iloc[-1]
        prior_high = frame['high'].iloc[-21:-1].max()
        average_volume = frame['volume'].iloc[-21:-1].mean()

        if recent_close <= prior_high or recent_volume <= average_volume * 1.5:
            return None

        breakout_strength = ((recent_close - prior_high) / prior_high) * 100 if prior_high else 0
        volume_boost = recent_volume / average_volume if average_volume else 1
        confidence = round(min(0.99, 0.62 + breakout_strength * 0.03 + (volume_boost - 1) * 0.08), 2)
        success_rate = round(min(0.93, 0.54 + breakout_strength * 0.015 + (volume_boost - 1) * 0.04), 2)
        return TechnicalPattern(pattern='breakout', confidence=confidence, historical_success_rate=success_rate)

    def detect_support_resistance(self, frame: pd.DataFrame) -> Optional[TechnicalPattern]:
        latest_close = frame['close'].iloc[-1]
        rolling_support = frame['low'].tail(30).quantile(0.2)
        rolling_resistance = frame['high'].tail(30).quantile(0.8)
        trading_range = max(rolling_resistance - rolling_support, 1e-6)
        proximity = min(abs(latest_close - rolling_support), abs(rolling_resistance - latest_close)) / trading_range

        if proximity > 0.12:
            return None

        confidence = round(max(0.55, min(0.95, 0.88 - proximity * 1.5)), 2)
        success_rate = round(max(0.51, min(0.89, 0.79 - proximity)), 2)
        return TechnicalPattern(pattern='support_resistance', confidence=confidence, historical_success_rate=success_rate)

    def detect_rsi_divergence(self, frame: pd.DataFrame) -> Optional[TechnicalPattern]:
        rsi = self._calculate_rsi(frame['close'])
        if rsi.tail(5).isna().any():
            return None

        recent_prices = frame['close'].tail(5).reset_index(drop=True)
        recent_rsi = rsi.tail(5).reset_index(drop=True)
        price_trend = recent_prices.iloc[-1] - recent_prices.iloc[0]
        rsi_trend = recent_rsi.iloc[-1] - recent_rsi.iloc[0]

        divergence_detected = (price_trend > 0 and rsi_trend < 0) or (price_trend < 0 and rsi_trend > 0)
        if not divergence_detected:
            return None

        divergence_strength = abs(price_trend / max(recent_prices.iloc[0], 1)) + abs(rsi_trend / 100)
        confidence = round(min(0.97, 0.58 + divergence_strength * 2.5), 2)
        success_rate = round(min(0.84, 0.5 + divergence_strength * 1.6), 2)
        return TechnicalPattern(pattern='rsi_divergence', confidence=confidence, historical_success_rate=success_rate)

    def analyze(self, payload: TechnicalAnalysisRequest) -> TechnicalAnalysisResponse:
        frame = self.to_dataframe(payload)
        patterns = []

        breakout = self.detect_breakout(frame)
        if breakout:
            patterns.append(breakout)

        support_resistance = self.detect_support_resistance(frame)
        if support_resistance:
            patterns.append(support_resistance)

        rsi_divergence = self.detect_rsi_divergence(frame)
        if rsi_divergence:
            patterns.append(rsi_divergence)

        return TechnicalAnalysisResponse(symbol=payload.symbol, patterns=patterns)
