from typing import List, Dict, Any, Optional
from app.services.ai.providers.base import AIProvider
from app.core.config import settings
import httpx

class AnthropicProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL or "claude-3-opus-20240229"
        self.base_url = settings.AI_API_BASE or "https://api.anthropic.com/v1"

    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        system_msg = None
        chat_messages = []
        for m in messages:
            if m["role"] == "system":
                system_msg = m["content"]
            else:
                chat_messages.append({"role": m["role"], "content": m["content"]})
        async with httpx.AsyncClient() as client:
            body = {"model": self.model, "messages": chat_messages, "max_tokens": max_tokens or 4096, "temperature": temperature}
            if system_msg:
                body["system"] = system_msg
            resp = await client.post(f"{self.base_url}/messages", headers={"x-api-key": self.api_key, "anthropic-version": "2023-06-01"}, json=body)
            data = resp.json()
            return {"content": data["content"][0]["text"], "tokens_used": data.get("usage", {}).get("input_tokens", 0) + data.get("usage", {}).get("output_tokens", 0), "model": self.model}

    async def analyze(self, prompt: str, context: Optional[str] = None) -> Dict[str, Any]:
        system = "You are an expert trading AI assistant. Analyze the following data and provide market insights."
        messages = [{"role": "user", "content": f"{system}\n\n{context or ''}\n\n{prompt}"}]
        return await self.chat(messages, temperature=0.3)
