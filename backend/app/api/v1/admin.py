from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_session
from app.models.user import User, UserRole
from app.models.subscription import Subscription
from app.models.conversation import Conversation
from app.models.audit_log import AuditLog
from app.schemas.admin import AdminUserResponse, AdminUsersList, AdminStats, AdminSubscriptionUpdate
from app.core.deps import get_admin_user
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def list_users(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), search: Optional[str] = None, session: AsyncSession = Depends(get_session), admin: User = Depends(get_admin_user)):
    query = select(User)
    if search:
        query = query.where(User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%"))
    total = await session.execute(select(func.count()).select_from(query.subquery()))
    query = query.order_by(desc(User.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(query)
    users = []
    for u in result.scalars().all():
        sub_result = await session.execute(select(Subscription).where(Subscription.user_id == u.id))
        sub = sub_result.scalar_one_or_none()
        users.append(AdminUserResponse(id=str(u.id), email=u.email, name=u.name, role=u.role.value, is_active=u.is_active, plan=sub.plan.value if sub else "free", created_at=u.created_at.isoformat(), last_login=u.created_at.isoformat()))
    return AdminUsersList(users=users, total=total.scalar(), page=page, page_size=page_size)

@router.get("/stats")
async def get_stats(session: AsyncSession = Depends(get_session), admin: User = Depends(get_admin_user)):
    total_users = await session.execute(select(func.count()).select_from(User))
    active_subs = await session.execute(select(func.count()).select_from(Subscription).where(Subscription.status == "active"))
    total_convs = await session.execute(select(func.count()).select_from(Conversation))
    return AdminStats(total_users=total_users.scalar(), active_users=active_subs.scalar(), total_conversations=total_convs.scalar(), total_ai_queries=0, total_subscriptions={"free": 0, "pro": 0, "elite": 0}, revenue={"total": 0, "monthly": 0}, ai_costs={"total": 0, "monthly": 0})

@router.put("/users/{user_id}/subscription")
async def update_user_subscription(user_id: str, req: AdminSubscriptionUpdate, session: AsyncSession = Depends(get_session), admin: User = Depends(get_admin_user)):
    result = await session.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subscription(user_id=user_id)
        session.add(sub)
    sub.plan = req.plan
    sub.status = req.status
    await session.commit()
    return {"message": "Subscription updated"}

@router.get("/logs")
async def get_audit_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), session: AsyncSession = Depends(get_session), admin: User = Depends(get_admin_user)):
    result = await session.execute(select(AuditLog).order_by(desc(AuditLog.created_at)).offset((page - 1) * page_size).limit(page_size))
    logs = result.scalars().all()
    total = await session.execute(select(func.count()).select_from(AuditLog))
    return {"logs": [{"id": str(l.id), "user_id": str(l.user_id) if l.user_id else None, "action": l.action.value, "resource": l.resource, "details": l.details, "ip_address": l.ip_address, "created_at": l.created_at.isoformat()} for l in logs], "total": total.scalar(), "page": page, "page_size": page_size}
