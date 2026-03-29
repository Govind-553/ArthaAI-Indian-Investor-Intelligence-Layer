from __future__ import annotations
from typing import Optional
from app.schemas.insights import VideoGenerationRequest, VideoGenerationResponse, VideoStatusResponse
from app.services.video_assets_service import MarketVideoScriptService, MarketChartService
from app.services.sora2api_client import Sora2ApiClient


class VideoGenerationPipelineService:
    def __init__(self, script_service: Optional[MarketVideoScriptService] = None, chart_service: Optional[MarketChartService] = None, sora_client: Optional[Sora2ApiClient] = None) -> None:
        self.script_service = script_service or MarketVideoScriptService()
        self.chart_service = chart_service or MarketChartService()
        self.sora_client = sora_client or Sora2ApiClient()

    def generate_video(self, payload: VideoGenerationRequest) -> VideoGenerationResponse:
        script = self.script_service.build_script(payload)
        chart_path = self.chart_service.generate_chart(payload)
        prompt = (
            f"Create a polished 10-second financial market video. Script: {script}. "
            f"Visual direction: modern finance motion graphics, data-led composition, clean labels, Indian stock market context."
        )
        provider_response = self.sora_client.generate_video(
            prompt=prompt,
            duration=payload.duration,
            aspect_ratio=payload.aspect_ratio,
            image_url=payload.image_url,
        )
        return VideoGenerationResponse(
            task_id=provider_response.get('taskId', 'unknown-task'),
            status=provider_response.get('status', 'queued'),
            script=script,
            chart_path=chart_path,
            video_provider=provider_response.get('provider', 'sora2api'),
        )

    def check_video_status(self, task_id: str) -> VideoStatusResponse:
        provider_response = self.sora_client.check_status(task_id)
        return VideoStatusResponse(
            task_id=provider_response.get('taskId', task_id),
            status=provider_response.get('status', 'unknown'),
            video_url=provider_response.get('videoUrl'),
            provider_response=provider_response,
        )


