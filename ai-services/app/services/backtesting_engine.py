from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from app.repositories.market_data_repository import MarketDataRepository
from app.schemas.insights import BacktestRequest, BacktestResponse, BacktestPatternResult, TechnicalAnalysisRequest
from app.services.technical_analysis_engine import TechnicalAnalysisEngineService


class BacktestingEngineService:
    def __init__(self, repository: Optional[MarketDataRepository] = None, technical_engine: Optional[TechnicalAnalysisEngineService] = None) -> None:
        self.repository = repository or MarketDataRepository()
        self.technical_engine = technical_engine or TechnicalAnalysisEngineService()

    def _trade_outcome(self, entry_price: float, future_window, target_return_pct: float, stop_loss_pct: float) -> tuple[bool, float, float]:
        target_price = entry_price * (1 + target_return_pct / 100)
        stop_price = entry_price * (1 - stop_loss_pct / 100)
        max_reward = (future_window['high'].max() - entry_price) / entry_price if entry_price else 0
        max_risk = (entry_price - future_window['low'].min()) / entry_price if entry_price else 0

        for _, row in future_window.iterrows():
            if row['high'] >= target_price:
                return True, max_reward, max_risk
            if row['low'] <= stop_price:
                return False, max_reward, max_risk

        return future_window['close'].iloc[-1] > entry_price, max_reward, max_risk

    def _evaluate_pattern(self, symbol: str, frame, pattern_name: str, detector, lookahead_period: int, target_return_pct: float, stop_loss_pct: float) -> Optional[BacktestPatternResult]:
        wins = 0
        trades = 0
        reward_sum = 0.0
        risk_sum = 0.0

        for end_idx in range(30, len(frame) - lookahead_period):
            window = frame.iloc[: end_idx + 1]
            detected = detector(window)
            if not detected:
                continue

            trades += 1
            entry_price = window['close'].iloc[-1]
            future_window = frame.iloc[end_idx + 1 : end_idx + 1 + lookahead_period]
            success, reward, risk = self._trade_outcome(entry_price, future_window, target_return_pct, stop_loss_pct)
            if success:
                wins += 1
            reward_sum += max(reward, 0)
            risk_sum += max(risk, 0)

        if trades == 0:
            return None

        accuracy_pct = round((wins / trades) * 100, 2)
        avg_reward = reward_sum / trades if trades else 0
        avg_risk = risk_sum / trades if trades else 0
        risk_reward_ratio = round(avg_reward / avg_risk, 2) if avg_risk > 0 else round(avg_reward, 2)

        return BacktestPatternResult(
            pattern=pattern_name,
            accuracy_pct=accuracy_pct,
            risk_reward_ratio=risk_reward_ratio,
            trades=trades,
        )

    def run(self, payload: BacktestRequest) -> BacktestResponse:
        frame = self.technical_engine.to_dataframe(TechnicalAnalysisRequest(symbol=payload.symbol, candles=payload.candles))

        detectors = [
            ('breakout', self.technical_engine.detect_breakout),
            ('support_resistance', self.technical_engine.detect_support_resistance),
            ('rsi_divergence', self.technical_engine.detect_rsi_divergence),
        ]

        results = []
        for pattern_name, detector in detectors:
            result = self._evaluate_pattern(
                payload.symbol,
                frame,
                pattern_name,
                detector,
                payload.lookahead_period,
                payload.target_return_pct,
                payload.stop_loss_pct,
            )
            if result:
                results.append(result)

        document = {
            'symbol': payload.symbol.upper(),
            'lookahead_period': payload.lookahead_period,
            'target_return_pct': payload.target_return_pct,
            'stop_loss_pct': payload.stop_loss_pct,
            'results': [result.model_dump() for result in results],
            'created_at': datetime.now(timezone.utc).isoformat(),
        }
        stored_result_id = self.repository.save_backtest_result(document)

        return BacktestResponse(symbol=payload.symbol.upper(), results=results, stored_result_id=stored_result_id)


