from __future__ import annotations
import os
from datetime import datetime
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from app.core.config import get_settings
from app.schemas.insights import VideoGenerationRequest


class MarketVideoScriptService:
    def build_script(self, payload: VideoGenerationRequest) -> str:
        top_point = max(payload.market_data, key=lambda item: item.value)
        bottom_point = min(payload.market_data, key=lambda item: item.value)
        return (
            f"{payload.title}. {payload.summary}. "
            f"Top highlighted move is {top_point.label} at {top_point.value}. "
            f"Weakest point is {bottom_point.label} at {bottom_point.value}. "
            f"Present this as a concise ten-second market wrap for Indian investors."
        )


class MarketChartService:
    def __init__(self) -> None:
        self.settings = get_settings()
        os.makedirs(self.settings.video_output_dir, exist_ok=True)

    def generate_chart(self, payload: VideoGenerationRequest) -> str:
        labels = [point.label for point in payload.market_data]
        values = [point.value for point in payload.market_data]
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
        file_path = os.path.join(self.settings.video_output_dir, f'market_chart_{timestamp}.png')

        plt.figure(figsize=(8, 4.5))
        colors = ['#0f766e' if value >= 0 else '#dc2626' for value in values]
        plt.bar(labels, values, color=colors)
        plt.axhline(0, color='#334155', linewidth=1)
        plt.title(payload.title)
        plt.ylabel('Change (%)')
        plt.tight_layout()
        plt.savefig(file_path, dpi=160)
        plt.close()
        return file_path
