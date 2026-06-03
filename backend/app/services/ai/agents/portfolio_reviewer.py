from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class PortfolioReviewerAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Portfolio Reviewer"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Review portfolio:\n"
        prompt += f"Holdings: {input_data.get('positions', [])}\n"
        prompt += f"Total PnL: {input_data.get('total_pnl')}\n"
        prompt += f"Exposure: {input_data.get('exposure')}\n"
        prompt += "Provide: portfolio health assessment, rebalancing suggestions, risk analysis."
        return await ai_service.analyze(prompt, context="Portfolio Review Agent")
