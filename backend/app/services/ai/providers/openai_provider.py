from openai import AsyncOpenAI
from typing import List, Dict, Any, Optional
from app.services.ai.providers.base import AIProvider
from app.core.config import settings

class OpenAIProvider(AIProvider):
    def __init__(self):
        client_kwargs = {"api_key": settings.AI_API_KEY}
        if settings.AI_API_BASE:
            client_kwargs["base_url"] = settings.AI_API_BASE
        self.client = AsyncOpenAI(**client_kwargs)
        self.model = settings.AI_MODEL

    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        kwargs = {"model": self.model, "messages": messages, "temperature": temperature}
        if max_tokens:
            kwargs["max_tokens"] = max_tokens
        response = await self.client.chat.completions.create(**kwargs)
        return {"content": response.choices[0].message.content, "tokens_used": response.usage.total_tokens if response.usage else 0, "model": self.model, "metadata": f"model={self.model},tokens={response.usage.total_tokens if response.usage else 0}"}

    async def analyze(self, prompt: str, context: Optional[str] = None) -> Dict[str, Any]:
        system_msg = "You are an expert trading AI assistant. Analyze the following data and provide market insights."
        if context:
            system_msg += f"\n\nContext: {context}"
        messages = [{"role": "system", "content": system_msg}, {"role": "user", "content": prompt}]
        return await self.chat(messages, temperature=0.3)
