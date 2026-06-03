from abc import ABC, abstractmethod
from typing import Dict, Any

class TradingAgent(ABC):
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass
