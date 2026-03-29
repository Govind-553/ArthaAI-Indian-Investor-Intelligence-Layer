from __future__ import annotations
from functools import lru_cache
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

APP_ROOT = Path(__file__).resolve().parents[2]
DATA_ROOT = APP_ROOT / 'data'


def resolve_app_path(value: str, default_relative: str) -> str:
    raw_value = value or default_relative
    candidate = Path(raw_value)
    if candidate.is_absolute():
        return str(candidate)

    parts = candidate.parts
    if parts and parts[0] == 'ai-services':
        candidate = Path(*parts[1:])

    return str((APP_ROOT / candidate).resolve())


class Settings(BaseModel):
    service_name: str = os.getenv('AI_SERVICE_NAME', 'arthaai-ai-service')
    service_version: str = os.getenv('AI_SERVICE_VERSION', '1.0.0')
    default_confidence: str = os.getenv('AI_DEFAULT_CONFIDENCE', 'medium')
    mongodb_uri: str = os.getenv('MONGODB_URI')
    mongodb_database: str = os.getenv('MONGODB_DATABASE', 'arthaai_ai')
    ingestion_retry_count: int = int(os.getenv('INGESTION_RETRY_COUNT', '3'))
    ingestion_retry_delay_seconds: int = int(os.getenv('INGESTION_RETRY_DELAY_SECONDS', '1'))
    market_data_base_url: str = os.getenv('MARKET_DATA_BASE_URL', '')
    market_data_quotes_path: str = os.getenv('MARKET_DATA_QUOTES_PATH', '/quotes')
    market_data_api_key: str = os.getenv('MARKET_DATA_API_KEY', '')
    market_data_api_key_header: str = os.getenv('MARKET_DATA_API_KEY_HEADER', 'Authorization')
    market_data_api_key_prefix: str = os.getenv('MARKET_DATA_API_KEY_PREFIX', 'Bearer')
    market_data_symbols_param: str = os.getenv('MARKET_DATA_SYMBOLS_PARAM', 'symbols')
    market_data_market_param: str = os.getenv('MARKET_DATA_MARKET_PARAM', 'market')
    market_data_timeout_seconds: int = int(os.getenv('MARKET_DATA_TIMEOUT_SECONDS', '15'))
    market_data_provider_name: str = os.getenv('MARKET_DATA_PROVIDER_NAME', 'nse-bse-live')
    market_data_enable_mock_fallback: bool = os.getenv('MARKET_DATA_ENABLE_MOCK_FALLBACK', 'true').lower() == 'true'
    cohere_api_key: str = os.getenv('COHERE_API_KEY', '')
    cohere_chat_model: str = os.getenv('COHERE_CHAT_MODEL', 'command-a-03-2025')
    cohere_embed_model: str = os.getenv('COHERE_EMBED_MODEL', 'embed-v4.0')
    cohere_rerank_model: str = os.getenv('COHERE_RERANK_MODEL', 'rerank-v3.5')
    faiss_index_path: str = resolve_app_path(os.getenv('FAISS_INDEX_PATH', ''), 'data/financial_rag.index')
    faiss_metadata_path: str = resolve_app_path(os.getenv('FAISS_METADATA_PATH', ''), 'data/financial_rag_metadata.json')
    sora2api_key: str = os.getenv('SORA2API_KEY', '')
    sora2api_base_url: str = os.getenv('SORA2API_BASE_URL', 'https://sora2api.org/api')
    video_output_dir: str = resolve_app_path(os.getenv('VIDEO_OUTPUT_DIR', ''), 'data/video_assets')


@lru_cache
def get_settings() -> Settings:
    return Settings()
