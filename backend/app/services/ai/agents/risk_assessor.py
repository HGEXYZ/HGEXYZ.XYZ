from typing import Dict, Any
from app.services.ai.agents.base import TradingAgent
from app.services.ai.service import ai_service

class RiskAssessorAgent(TradingAgent):
    @property
    def name(self) -> str:
        return "Risk Assessor"

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Assess risk for position:\n"
        prompt += f"Symbol: {input_data.get('symbol')}\n"
        prompt += f"Side: {input_data.get('side')}\n"
        prompt += f"Entry: {input_data.get('entry_price')}\n"
        prompt += f"Stop Loss: {input_data.get('stop_loss')}\n"
        prompt += f"Take Profit: {input_data.get('take_profit')}\n"
        prompt += f"Account Balance: {input_data.get('balance')}\n"
        prompt += "Provide: risk/reward ratio, position sizing recommendation, risk score."
        return await ai_service.analyze(prompt, context="Risk Assessment Agent")
