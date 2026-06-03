from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class TradeIdeaGeneratorAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Trade Idea Generator"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Generate trade ideas based on:\n"
        prompt += f"Markets: {input_data.get('markets', {})}\n"
        prompt += f"Watchlist: {input_data.get('watchlist', [])}\n"
        prompt += f"Risk Tolerance: {input_data.get('risk_tolerance', 'moderate')}\n"
        prompt += "Provide: 3 trade ideas with entry, stop loss, take profit, and rationale."
        return await ai_service.analyze(prompt, context="Trade Idea Generator")
