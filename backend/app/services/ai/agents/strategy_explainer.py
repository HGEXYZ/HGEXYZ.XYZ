from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class StrategyExplainerAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Strategy Explainer"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Explain the following trading strategy:\n{input_data.get('strategy', '')}\n"
        prompt += "Provide: strategy overview, entry/exit rules, risk management, ideal market conditions."
        return await ai_service.analyze(prompt, context="Strategy Explainer Agent")
