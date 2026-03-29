from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, File, Form, UploadFile
from app.repositories.market_data_repository import MarketDataRepository
from app.schemas.insights import InsightRequest, InsightResponse, SignalScoreRequest, IngestionTriggerRequest, FilingParseResponse, SignalDetectionRequest, SignalDetectionResponse, TechnicalAnalysisRequest, TechnicalAnalysisResponse, BacktestRequest, BacktestResponse, RagIndexRequest, RagQueryRequest, RagQueryResponse, VideoGenerationRequest, VideoGenerationResponse, VideoStatusResponse
from app.services.insight_service import InsightGenerationService, SignalScoringService
from app.services.ingestion_service import IngestionService
from app.services.filings_parser_service import CorporateFilingsParserService
from app.services.signal_detection_engine import SignalDetectionEngineService
from app.services.technical_analysis_engine import TechnicalAnalysisEngineService
from app.services.backtesting_engine import BacktestingEngineService
from app.services.financial_rag_service import FinancialRagService
from app.services.video_generation_pipeline import VideoGenerationPipelineService

router = APIRouter(prefix='/api/v1', tags=['insights'])
insight_service = InsightGenerationService()
signal_service = SignalScoringService()
ingestion_service = IngestionService()
filings_parser_service = CorporateFilingsParserService()
signal_detection_engine = SignalDetectionEngineService()
technical_analysis_engine = TechnicalAnalysisEngineService()
backtesting_engine = BacktestingEngineService()
financial_rag_service = FinancialRagService()
video_generation_pipeline = VideoGenerationPipelineService()
repository = MarketDataRepository()


@router.get('/health')
def health_check() -> dict:
    return {'status': 'ok', 'service': 'arthaai-ai-service'}


@router.post('/insights/generate', response_model=InsightResponse)
def generate_insight(payload: InsightRequest) -> InsightResponse:
    return insight_service.generate(payload)


@router.post('/signals/score')
def score_signal(payload: SignalScoreRequest) -> dict:
    return signal_service.score(payload)


@router.post('/signals/detect', response_model=SignalDetectionResponse)
def detect_signals(payload: SignalDetectionRequest) -> SignalDetectionResponse:
    return signal_detection_engine.detect(payload)


@router.post('/technical-analysis/analyze', response_model=TechnicalAnalysisResponse)
def analyze_technical_patterns(payload: TechnicalAnalysisRequest) -> TechnicalAnalysisResponse:
    return technical_analysis_engine.analyze(payload)


@router.post('/backtesting/run', response_model=BacktestResponse)
def run_backtest(payload: BacktestRequest) -> BacktestResponse:
    return backtesting_engine.run(payload)


@router.post('/rag/index')
def index_rag_documents(payload: RagIndexRequest) -> dict:
    return financial_rag_service.index_documents(payload)


@router.post('/rag/query', response_model=RagQueryResponse)
def query_rag(payload: RagQueryRequest) -> RagQueryResponse:
    return financial_rag_service.query(payload)


@router.post('/video/generate', response_model=VideoGenerationResponse)
def generate_market_video(payload: VideoGenerationRequest) -> VideoGenerationResponse:
    return video_generation_pipeline.generate_video(payload)


@router.get('/video/status/{task_id}', response_model=VideoStatusResponse)
def get_video_status(task_id: str) -> VideoStatusResponse:
    return video_generation_pipeline.check_video_status(task_id)


@router.post('/ingestion/trigger', status_code=202)
def trigger_ingestion(payload: IngestionTriggerRequest, background_tasks: BackgroundTasks) -> dict:
    job_id = ingestion_service.trigger_ingestion(payload)
    background_tasks.add_task(ingestion_service.run_ingestion_job, job_id, payload)
    return {
        'job_id': job_id,
        'status': 'queued',
        'symbols': [symbol.upper() for symbol in payload.symbols],
    }


@router.get('/ingestion/jobs/{job_id}')
def get_ingestion_job(job_id: str) -> dict:
    job = repository.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Ingestion job not found')
    return job


@router.post('/filings/parse', response_model=FilingParseResponse)
async def parse_filing(raw_text: Optional[str] = Form(default=None), file: Optional[UploadFile] = File(default=None)) -> FilingParseResponse:
    if not raw_text and not file:
        raise HTTPException(status_code=400, detail='Either raw_text or file is required')

    file_bytes = await file.read() if file else None
    filename = file.filename if file else None
    return filings_parser_service.parse_filing(raw_text=raw_text, file_bytes=file_bytes, filename=filename)
