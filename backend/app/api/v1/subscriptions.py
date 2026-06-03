from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_session
from app.models.user import User
from app.models.subscription import Subscription, PlanType
from app.schemas.subscription import SubscriptionResponse, CreateCheckoutSession, SubscriptionPlans
from app.core.deps import get_current_user
from app.core.config import settings
import stripe

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/plans")
async def get_plans():
    return SubscriptionPlans(free={"price": 0, "features": ["5 conversations/day", "Basic indicators", "1 watchlist"], "limits": {"chat": 5, "backtests": 1, "watchlists": 1}}, pro={"price": 29, "features": ["50 conversations/day", "Advanced indicators", "SMC analysis", "5 watchlists", "Backtesting", "News intelligence"], "limits": {"chat": 50, "backtests": 20, "watchlists": 5}}, elite={"price": 99, "features": ["Unlimited conversations", "All features", "Strategy builder", "Chart analysis AI", "Priority support", "API access"], "limits": {"chat": -1, "backtests": -1, "watchlists": -1}})

@router.get("/current")
async def get_subscription(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subscription(user_id=user.id)
        session.add(sub)
        await session.commit()
        await session.refresh(sub)
    return SubscriptionResponse(id=str(sub.id), plan=sub.plan.value, status=sub.status.value, current_period_start=sub.current_period_start.isoformat() if sub.current_period_start else None, current_period_end=sub.current_period_end.isoformat() if sub.current_period_end else None, created_at=sub.created_at.isoformat())

@router.post("/create-checkout")
async def create_checkout(req: CreateCheckoutSession, user: User = Depends(get_current_user)):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=400, detail="Stripe not configured")
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        checkout = await stripe.checkout.Session.create_async( customer_email=user.email, mode="subscription", line_items=[{"price": req.price_id, "quantity": 1}], success_url=req.success_url, cancel_url=req.cancel_url, metadata={"user_id": str(user.id)})
        return {"url": checkout.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, session: AsyncSession = Depends(get_session)):
    if not settings.STRIPE_WEBHOOK_SECRET:
        return {"received": True}
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except:
        raise HTTPException(status_code=400, detail="Invalid signature")
    if event["type"] == "checkout.session.completed":
        customer_id = event["data"]["object"]["customer"]
        user_id = event["data"]["object"]["metadata"]["user_id"]
        result = await session.execute(select(Subscription).where(Subscription.user_id == user_id))
        sub = result.scalar_one_or_none()
        if sub:
            sub.stripe_customer_id = customer_id
            sub.status = "active"
            await session.commit()
    return {"received": True}
