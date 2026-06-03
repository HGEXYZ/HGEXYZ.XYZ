from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class MarketAnalystAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Market Analyst"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Analyze the market for {input_data.get('symbol', 'unknown')}:\n"
        prompt += f"Price: {input_data.get('price')}\n"
        prompt += f"Technical Indicators: {input_data.get('indicators', {})}\n"
        prompt += "Provide: trend analysis, support/resistance levels, key levels to watch."
        return await ai_service.analyze(prompt, context="Market Analysis Agent")
