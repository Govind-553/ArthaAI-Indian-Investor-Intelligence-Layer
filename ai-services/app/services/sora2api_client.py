from __future__ import annotations
from typing import Optional
import httpx
from app.core.config import get_settings


class Sora2ApiClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def generate_video(self, prompt: str, duration: int, aspect_ratio: str, image_url: Optional[str] = None) -> dict:
        if not self.settings.sora2api_key:
            return {
                'taskId': 'mock-task-id',
                'status': 'queued',
                'provider': 'sora2api-mock',
            }

        payload = {
            'prompt': prompt,
            'aspectRatio': aspect_ratio,
            'duration': duration,
        }
        if image_url:
            payload['imageUrl'] = image_url

        response = httpx.post(
            f"{self.settings.sora2api_base_url}/generate-video",
            headers={
                'Authorization': f"Bearer {self.settings.sora2api_key}",
                'Content-Type': 'application/json',
            },
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()
        return response.json()

    def check_status(self, task_id: str) -> dict:
        if not self.settings.sora2api_key:
            return {
                'taskId': task_id,
                'status': 'completed',
                'videoUrl': 'https://example.com/mock-market-video.mp4',
            }

        response = httpx.post(
            f"{self.settings.sora2api_base_url}/check-video-status",
            headers={
                'Authorization': f"Bearer {self.settings.sora2api_key}",
                'Content-Type': 'application/json',
            },
            json={'taskId': task_id},
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


