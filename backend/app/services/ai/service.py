from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.ai.providers.openai_provider import OpenAIProvider
from app.services.ai.providers.anthropic_provider import AnthropicProvider
from app.services.ai.providers.base import AIProvider

class AIService:
    def __init__(self):
        self.provider: AIProvider = self._init_provider()

    def _init_provider(self) -> AIProvider:
        provider_map = {"openai": OpenAIProvider, "anthropic": AnthropicProvider}
        provider_class = provider_map.get(settings.AI_PROVIDER, OpenAIProvider)
        return provider_class()

    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        return await self.provider.chat(messages, temperature, max_tokens)

    async def analyze(self, prompt: str, context: Optional[str] = None) -> Dict[str, Any]:
        return await self.provider.analyze(prompt, context)

    async def market_analysis(self, symbol: str, price: float, indicators: dict) -> Dict[str, Any]:
        from app.services.ai.agents.market_analyst import MarketAnalystAgent
        agent = MarketAnalystAgent()
        return await agent.process({"symbol": symbol, "price": price, "indicators": indicators})

    async def risk_assessment(self, data: dict) -> Dict[str, Any]:
        from app.services.ai.agents.risk_assessor import RiskAssessorAgent
        agent = RiskAssessorAgent()
        return await agent.process(data)

    async def generate_trade_ideas(self, data: dict) -> Dict[str, Any]:
        from app.services.ai.agents.trade_idea_gen import TradeIdeaGeneratorAgent
        agent = TradeIdeaGeneratorAgent()
        return await agent.process(data)

    async def review_portfolio(self, data: dict) -> Dict[str, Any]:
        from app.services.ai.agents.portfolio_reviewer import PortfolioReviewerAgent
        agent = PortfolioReviewerAgent()
        return await agent.process(data)

ai_service = AIService()
