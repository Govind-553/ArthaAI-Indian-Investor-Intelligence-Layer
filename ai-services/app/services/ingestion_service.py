from __future__ import annotations
import time
from datetime import datetime, timezone
from typing import Optional
from app.core.config import get_settings
from app.repositories.market_data_repository import MarketDataRepository
from app.schemas.insights import IngestionResult, IngestionTriggerRequest, NormalizedMarketData
from app.services.nse_client import NseBseMarketClient


class IngestionService:
    def __init__(self, repository: Optional[MarketDataRepository] = None, nse_client: Optional[NseBseMarketClient] = None) -> None:
        self.settings = get_settings()
        self.repository = repository or MarketDataRepository()
        self.nse_client = nse_client or NseBseMarketClient(settings=self.settings)

    def normalize_market_data(self, raw_row: dict) -> dict:
        normalized = NormalizedMarketData(
            symbol=raw_row['symbol'].upper(),
            market=raw_row['exchange'],
            price=float(raw_row['lastPrice']),
            open=float(raw_row['openPrice']),
            high=float(raw_row['dayHigh']),
            low=float(raw_row['dayLow']),
            previous_close=float(raw_row['previousClose']),
            volume=int(raw_row['tradedVolume']),
            source=raw_row.get('source', self.settings.market_data_provider_name),
            as_of=raw_row['fetchedAt'],
        )
        return normalized.model_dump()

    def _fetch_with_retry(self, symbols: list[str], market: str) -> list[dict]:
        last_error = None
        for attempt in range(1, self.settings.ingestion_retry_count + 1):
            try:
                return self.nse_client.fetch_quotes(symbols, market)
            except Exception as error:
                last_error = error
                if attempt < self.settings.ingestion_retry_count:
                    time.sleep(self.settings.ingestion_retry_delay_seconds)
        raise last_error

    def trigger_ingestion(self, payload: IngestionTriggerRequest) -> str:
        job_payload = {
            'status': 'queued',
            'symbols': [symbol.upper() for symbol in payload.symbols],
            'market': payload.market.upper(),
            'records_processed': 0,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
        }
        return self.repository.create_job(job_payload)

    def run_ingestion_job(self, job_id: str, payload: IngestionTriggerRequest) -> IngestionResult:
        self.repository.update_job(
            job_id,
            {
                'status': 'running',
                'updated_at': datetime.now(timezone.utc).isoformat(),
            },
        )

        try:
            raw_quotes = self._fetch_with_retry(payload.symbols, payload.market.upper())
            normalized_quotes = [self.normalize_market_data(row) for row in raw_quotes]
            records_processed = self.repository.bulk_insert_market_data(normalized_quotes)
            final_status = 'completed'
            self.repository.update_job(
                job_id,
                {
                    'status': final_status,
                    'records_processed': records_processed,
                    'updated_at': datetime.now(timezone.utc).isoformat(),
                },
            )
            return IngestionResult(
                job_id=job_id,
                status=final_status,
                records_processed=records_processed,
                symbols=[symbol.upper() for symbol in payload.symbols],
            )
        except Exception as error:
            self.repository.update_job(
                job_id,
                {
                    'status': 'failed',
                    'error': str(error),
                    'updated_at': datetime.now(timezone.utc).isoformat(),
                },
            )
            raise

