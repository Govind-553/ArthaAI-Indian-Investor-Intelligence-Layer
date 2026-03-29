from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, Union
import httpx
from app.core.config import get_settings


class MarketDataProviderError(Exception):
    pass


class MockNseMarketClient:
    def __init__(self) -> None:
        self.mock_prices = {
            'RELIANCE': 2945.35,
            'TCS': 4022.40,
            'INFY': 1610.25,
            'HDFCBANK': 1688.60,
            'ICICIBANK': 1192.90,
            'SBIN': 812.45,
        }

    def fetch_quotes(self, symbols: list[str], market: str) -> list[dict]:
        timestamp = datetime.now(timezone.utc).isoformat()
        quotes = []

        for index, symbol in enumerate(symbols):
            last_price = self.mock_prices.get(symbol.upper(), 1000 + (index * 25))
            quotes.append(
                {
                    'symbol': symbol.upper(),
                    'exchange': market,
                    'lastPrice': last_price,
                    'openPrice': round(last_price * 0.985, 2),
                    'dayHigh': round(last_price * 1.018, 2),
                    'dayLow': round(last_price * 0.978, 2),
                    'previousClose': round(last_price * 0.992, 2),
                    'tradedVolume': 100000 + (index * 15000),
                    'fetchedAt': timestamp,
                    'source': 'mock-nse-api',
                }
            )

        return quotes


class NseBseMarketClient:
    def __init__(self, settings=None, http_client: Optional[httpx.Client] = None, fallback_client: Optional[MockNseMarketClient] = None) -> None:
        self.settings = settings or get_settings()
        self.http_client = http_client or httpx.Client(timeout=self.settings.market_data_timeout_seconds)
        self.fallback_client = fallback_client or MockNseMarketClient()

    def _build_headers(self) -> dict[str, str]:
        headers = {'Accept': 'application/json'}
        if self.settings.market_data_api_key:
            prefix = self.settings.market_data_api_key_prefix.strip()
            token = self.settings.market_data_api_key.strip()
            headers[self.settings.market_data_api_key_header] = f'{prefix} {token}'.strip() if prefix else token
        return headers

    def _extract_rows(self, payload: Union[dict, list]) -> list[dict]:
        if isinstance(payload, list):
            return payload

        if not isinstance(payload, dict):
            raise MarketDataProviderError('Market data response must be a JSON object or list')

        for key in ('data', 'results', 'quotes', 'stocks', 'items'):
            rows = payload.get(key)
            if isinstance(rows, list):
                return rows
            if isinstance(rows, dict):
                return [{**value, 'symbol': value.get('symbol', row_key)} for row_key, value in rows.items() if isinstance(value, dict)]

        if all(not isinstance(value, (list, dict)) for value in payload.values()):
            return [payload]

        raise MarketDataProviderError('Unable to locate quote rows in market data response')

    def _pick_first(self, row: dict, fields: tuple[str, ...], default=None):
        for field in fields:
            value = row.get(field)
            if value is not None:
                return value
        return default

    def _normalize_row(self, row: dict, requested_market: str) -> dict:
        timestamp = datetime.now(timezone.utc).isoformat()
        symbol = str(self._pick_first(row, ('symbol', 'ticker', 'tradingsymbol', 'securityId', 'code'), '')).upper()
        if not symbol:
            raise MarketDataProviderError('Provider response is missing symbol')

        market = str(self._pick_first(row, ('exchange', 'market', 'segment'), requested_market)).upper()
        last_price = float(self._pick_first(row, ('lastPrice', 'ltp', 'price', 'close', 'last_trade_price')))
        open_price = float(self._pick_first(row, ('openPrice', 'open', 'dayOpen'), last_price))
        day_high = float(self._pick_first(row, ('dayHigh', 'high', 'dayHighPrice'), last_price))
        day_low = float(self._pick_first(row, ('dayLow', 'low', 'dayLowPrice'), last_price))
        previous_close = float(self._pick_first(row, ('previousClose', 'prevClose', 'previous_close', 'closePrice'), last_price))
        traded_volume = int(float(self._pick_first(row, ('tradedVolume', 'volume', 'totalTradedVolume', 'ttVolume'), 0)))
        fetched_at = self._pick_first(row, ('fetchedAt', 'timestamp', 'updatedAt', 'lastUpdateTime'), timestamp)

        return {
            'symbol': symbol,
            'exchange': market,
            'lastPrice': last_price,
            'openPrice': open_price,
            'dayHigh': day_high,
            'dayLow': day_low,
            'previousClose': previous_close,
            'tradedVolume': traded_volume,
            'fetchedAt': fetched_at,
            'source': self.settings.market_data_provider_name,
        }

    def fetch_quotes(self, symbols: list[str], market: str) -> list[dict]:
        if not self.settings.market_data_base_url:
            if self.settings.market_data_enable_mock_fallback:
                return self.fallback_client.fetch_quotes(symbols, market)
            raise MarketDataProviderError('MARKET_DATA_BASE_URL is not configured')

        request_symbols = [symbol.upper() for symbol in symbols]
        request_market = market.upper()
        url = f"{self.settings.market_data_base_url.rstrip('/')}/{self.settings.market_data_quotes_path.lstrip('/')}"
        params = {
            self.settings.market_data_symbols_param: ','.join(request_symbols),
            self.settings.market_data_market_param: request_market,
        }

        try:
            response = self.http_client.get(url, params=params, headers=self._build_headers())
            response.raise_for_status()
            rows = self._extract_rows(response.json())
            return [self._normalize_row(row, request_market) for row in rows]
        except Exception:
            if self.settings.market_data_enable_mock_fallback:
                return self.fallback_client.fetch_quotes(symbols, market)
            raise

