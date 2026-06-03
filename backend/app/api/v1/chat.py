from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_session
from app.models.user import User
from app.models.conversation import Conversation, Message, MessageRole
from app.schemas.chat import ChatRequest, ConversationCreate, ConversationUpdate, ConversationResponse, MessageResponse, ChatResponse
from app.core.deps import get_current_user
from app.services.ai.service import ai_service
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/conversations", status_code=201)
async def create_conversation(req: ConversationCreate, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    conv = Conversation(user_id=user.id, title=req.title)
    session.add(conv)
    await session.commit()
    await session.refresh(conv)
    return ConversationResponse(id=str(conv.id), title=conv.title, created_at=conv.created_at.isoformat(), updated_at=conv.updated_at.isoformat())

@router.get("/conversations")
async def list_conversations(search: Optional[str] = None, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    query = select(Conversation).where(Conversation.user_id == user.id).order_by(desc(Conversation.updated_at))
    if search:
        query = query.where(Conversation.title.ilike(f"%{search}%"))
    result = await session.execute(query)
    convs = result.scalars().all()
    response = []
    for c in convs:
        msg_count = await session.execute(select(func.count()).select_from(Message).where(Message.conversation_id == c.id))
        response.append(ConversationResponse(id=str(c.id), title=c.title, created_at=c.created_at.isoformat(), updated_at=c.updated_at.isoformat(), message_count=msg_count.scalar()))
    return response

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs_result = await session.execute(select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at))
    msgs = [MessageResponse(id=str(m.id), role=m.role.value, content=m.content, created_at=m.created_at.isoformat(), metadata=m.metadata) for m in msgs_result.scalars().all()]
    return {"conversation": ConversationResponse(id=str(conv.id), title=conv.title, created_at=conv.created_at.isoformat(), updated_at=conv.updated_at.isoformat(), message_count=len(msgs)), "messages": msgs}

@router.put("/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, req: ConversationUpdate, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = req.title
    await session.commit()
    return ConversationResponse(id=str(conv.id), title=conv.title, created_at=conv.created_at.isoformat(), updated_at=conv.updated_at.isoformat())

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await session.delete(conv)
    await session.commit()
    return {"message": "Conversation deleted"}

@router.post("/messages")
async def send_message(req: ChatRequest, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if req.conversation_id:
        result = await session.execute(select(Conversation).where(Conversation.id == req.conversation_id, Conversation.user_id == user.id))
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(user_id=user.id, title=req.message[:100])
        session.add(conv)
        await session.flush()
    user_msg = Message(conversation_id=conv.id, role=MessageRole.USER, content=req.message)
    session.add(user_msg)
    await session.commit()
    messages_result = await session.execute(select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at))
    history = [{"role": m.role.value, "content": m.content} for m in messages_result.scalars().all()]
    ai_response = await ai_service.chat(history)
    ai_msg = Message(conversation_id=conv.id, role=MessageRole.ASSISTANT, content=ai_response["content"], tokens_used=ai_response.get("tokens_used", 0), metadata=ai_response.get("metadata"))
    session.add(ai_msg)
    await session.commit()
    await session.refresh(ai_msg)
    await session.refresh(user_msg)
    return ChatResponse(conversation_id=str(conv.id), message=MessageResponse(id=str(ai_msg.id), role=ai_msg.role.value, content=ai_msg.content, created_at=ai_msg.created_at.isoformat(), metadata=ai_msg.metadata))
