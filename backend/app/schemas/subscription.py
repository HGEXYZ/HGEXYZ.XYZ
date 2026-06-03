from pydantic import BaseModel
from typing import Optional

class SubscriptionResponse(BaseModel):
    id: str
    plan: str
    status: str
    current_period_start: Optional[str]
    current_period_end: Optional[str]
    created_at: str

class CreateCheckoutSession(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

class SubscriptionPlans(BaseModel):
    free: dict
    pro: dict
    elite: dict
