from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class EconomicSummarizerAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Economic Summarizer"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Summarize and analyze these economic events:\n{input_data.get('events', [])}\n"
        prompt += "Provide: event impact analysis, market expectations, trading implications."
        return await ai_service.analyze(prompt, context="Economic News Agent")
