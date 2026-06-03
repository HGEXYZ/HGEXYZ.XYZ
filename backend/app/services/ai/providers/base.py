from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: Optional[int] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def analyze(self, prompt: str, context: Optional[str] = None) -> Dict[str, Any]:
        pass
