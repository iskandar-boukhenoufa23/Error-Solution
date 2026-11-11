from fastapi import Header, HTTPException
from app.db.database import supabase
from app.core.security import verify_clerk_token


async def get_current_user(
    authorization: str = Header(...)
):

	scheme, _, token = authorization.partition(" ")
	if scheme.lower() != "bearer" or not token.strip():
		raise HTTPException(status_code=401, detail="Invalid auth header")
	token = token.strip()
	payload = await verify_clerk_token(token)

	user_id = payload.get("sub")
	if not user_id:
		raise HTTPException(status_code=401, detail="Invalid Clerk token")
	full_name = f"{payload.get('first_name', '')} {payload.get('last_name', '')}".strip()
	email = payload.get("email")


	user = None

    # 🔍 check user exists
	response = supabase.table("users") \
        .select("*") \
        .eq("id", user_id) \
        .maybe_single() \
        .execute()

	user = response.data
	if user is None:
		create_response = supabase.table("users").insert({
            "id": user_id,
            "full_name": full_name,
            "email": email
        }).execute()
		if not create_response.data:
			raise HTTPException(status_code=500, detail="Unable to create user profile")
		user = create_response.data[0]


	return user