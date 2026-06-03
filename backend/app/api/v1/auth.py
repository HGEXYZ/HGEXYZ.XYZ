from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.db.session import get_session
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog, AuditAction
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, PasswordResetRequest, PasswordResetConfirm, GoogleAuthRequest, LoginResponse, UserResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, request: Request, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(email=req.email, password_hash=hash_password(req.password), name=req.name)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    access = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh = create_refresh_token({"sub": str(user.id)})
    log = AuditLog(user_id=user.id, action=AuditAction.REGISTER, ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"))
    session.add(log)
    await session.commit()
    return LoginResponse(user=UserResponse(id=str(user.id), email=user.email, name=user.name, role=user.role.value, avatar_url=user.avatar_url, is_verified=user.is_verified, created_at=user.created_at.isoformat()), access_token=access, refresh_token=refresh)

@router.post("/login")
async def login(req: LoginRequest, request: Request, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh = create_refresh_token({"sub": str(user.id)})
    log = AuditLog(user_id=user.id, action=AuditAction.LOGIN, ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"))
    session.add(log)
    await session.commit()
    return LoginResponse(user=UserResponse(id=str(user.id), email=user.email, name=user.name, role=user.role.value, avatar_url=user.avatar_url, is_verified=user.is_verified, created_at=user.created_at.isoformat()), access_token=access, refresh_token=refresh)

@router.post("/refresh")
async def refresh(req: RefreshRequest, session: AsyncSession = Depends(get_session)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access = create_access_token({"sub": payload["sub"], "role": payload.get("role", "user")})
    refresh = create_refresh_token({"sub": payload["sub"]})
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse(id=str(user.id), email=user.email, name=user.name, role=user.role.value, avatar_url=user.avatar_url, is_verified=user.is_verified, created_at=user.created_at.isoformat())

@router.post("/google")
async def google_auth(req: GoogleAuthRequest, request: Request, session: AsyncSession = Depends(get_session)):
    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.id_token}")
        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")
        data = resp.json()
    result = await session.execute(select(User).where(User.google_id == data["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        result = await session.execute(select(User).where(User.email == data["email"]))
        user = result.scalar_one_or_none()
        if user:
            user.google_id = data["sub"]
        else:
            user = User(email=data["email"], name=data.get("name", data["email"]), google_id=data["sub"], avatar_url=data.get("picture"), is_verified=True)
            session.add(user)
    access = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh = create_refresh_token({"sub": str(user.id)})
    log = AuditLog(user_id=user.id, action=AuditAction.LOGIN, ip_address=request.client.host if request.client else None, user_agent=request.headers.get("user-agent"))
    session.add(log)
    await session.commit()
    await session.refresh(user)
    return LoginResponse(user=UserResponse(id=str(user.id), email=user.email, name=user.name, role=user.role.value, avatar_url=user.avatar_url, is_verified=user.is_verified, created_at=user.created_at.isoformat()), access_token=access, refresh_token=refresh)

@router.post("/logout")
async def logout(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    log = AuditLog(user_id=user.id, action=AuditAction.LOGOUT)
    session.add(log)
    await session.commit()
    return {"message": "Logged out"}

@router.post("/password-reset")
async def password_reset(req: PasswordResetRequest):
    return {"message": "If email exists, a reset link has been sent"}

@router.post("/password-reset/confirm")
async def password_reset_confirm(req: PasswordResetConfirm, session: AsyncSession = Depends(get_session)):
    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    result = await session.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.password_hash = hash_password(req.new_password)
    log = AuditLog(user_id=user.id, action=AuditAction.PASSWORD_RESET)
    session.add(log)
    await session.commit()
    return {"message": "Password reset successful"}
