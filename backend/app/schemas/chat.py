from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class ChatMessage(BaseModel):
	id: str
	role: str
	message: str
	created_at: datetime

class ChatResponse(BaseModel):
	id: str
	title: str
	created_at: datetime
	messages: List[ChatMessage] = Field(default_factory=list)
	preview: str | None = None
	last_message_at: datetime | None = None
