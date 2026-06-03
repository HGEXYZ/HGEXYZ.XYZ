from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    plan: str
    created_at: str
    last_login: Optional[str]

class AdminUsersList(BaseModel):
    users: List[AdminUserResponse]
    total: int
    page: int
    page_size: int

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_conversations: int
    total_ai_queries: int
    total_subscriptions: dict
    revenue: dict
    ai_costs: dict

class AdminSubscriptionUpdate(BaseModel):
    user_id: str
    plan: str
    status: str
