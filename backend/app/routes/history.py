from fastapi import APIRouter, HTTPException, Depends
from app.db.database import supabase
from app.middlewares.auth_middleware import get_current_user
from app.schemas.chat import ChatResponse
from typing import List


router = APIRouter()

@router.get("/chats", response_model=List[ChatResponse])
async def get_chats(user: dict = Depends(get_current_user)):
	try:
		user_id = user["id"]
		response = (
			supabase.table("chat")
			.select("*")
			.eq("user_id", user_id)
			.order("created_at", desc=True)
			.execute()
		)
		chats = response.data or []
		for chat in chats:
			latest_message = (
				supabase.table("messages")
				.select("message, created_at")
				.eq("chat_id", chat["id"])
				.order("created_at", desc=True)
				.limit(1)
				.execute()
			)
			latest = (latest_message.data or [None])[0]
			chat["preview"] = latest.get("message") if latest else None
			chat["last_message_at"] = latest.get("created_at") if latest else None
		return chats
	except Exception:
		raise HTTPException(status_code=500, detail="Unable to load conversations") from None

@router.get("/chat/{chat_id}", response_model=ChatResponse)
async def get_chat(
	chat_id: str,
	user: dict = Depends(get_current_user)
	):
	try:
		response = (
			supabase.table("chat")
			.select("*")
			.eq("id", chat_id)
			.eq("user_id", user["id"])
			.maybe_single()
			.execute()
		)
		if response.data is None:
			raise HTTPException(status_code=404, detail="Conversation not found")

		messages_response = (
			supabase.table("messages")
			.select("id, role, message, created_at")
			.eq("chat_id", chat_id)
			.order("created_at")
			.execute()
		)
		return {**response.data, "messages": messages_response.data or []}
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=500, detail="Unable to load conversation") from None




