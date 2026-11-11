from fastapi import APIRouter, HTTPException, Depends
from app.middlewares.auth_middleware import get_current_user
from app.schemas.message import MessageResponse, MessageCreate
from app.db.database import supabase
from app.services.error_rag import ask_error_assistant
import json
from starlette.concurrency import run_in_threadpool


router = APIRouter()

@router.post("/message/create", response_model=MessageResponse)
async def create_message(data: MessageCreate, user: dict = Depends(get_current_user)):
	try:
		message = data.message.strip()
		if not message:
			raise HTTPException(status_code=422, detail="Message cannot be empty")

		chat_id = data.chat_id
		if chat_id is not None:
			chat_response = (
				supabase.table("chat")
				.select("id")
				.eq("id", chat_id)
				.eq("user_id", user["id"])
				.maybe_single()
				.execute()
			)
			if chat_response.data is None:
				raise HTTPException(status_code=404, detail="Conversation not found")

		try:
			ai_result = await run_in_threadpool(
				ask_error_assistant,
				message,
			)

			ai_response = ai_result["answer"]
			sources = ai_result["sources"]
		except (FileNotFoundError, ImportError, OSError):
			raise HTTPException(
				status_code=503,
				detail="The error knowledge base is unavailable",
			) from None

		ai_response = [
			{
				"error": result["data"].get("error", ""),
				"fix": result["data"].get("fix", ""),
				"score": result["score"],
			}
			for result in retrieved
			if isinstance(result.get("data"), dict)
		]

		if chat_id is None:
			chat_response = supabase.table("chat").insert({
				"user_id": user["id"],
				"title": message[:80],
			}).execute()
			if not chat_response.data:
				raise HTTPException(status_code=500, detail="Unable to create conversation")
			chat_id = chat_response.data[0]["id"]

		supabase.table("messages").insert({
			"chat_id": chat_id,
			"role": "user",
			"message": message,
		}).execute()
		supabase.table("messages").insert({
			"chat_id": chat_id,
			"role": "assistant",
			"message": json.dumps(ai_response),
		}).execute()
		return {
			"chat_id": chat_id,
			"response": ai_response
		}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(
			status_code=500,
			detail="Unable to process message",
		)
