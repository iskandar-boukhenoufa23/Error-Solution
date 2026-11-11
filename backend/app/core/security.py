import httpx
from jose import jwt
from jose.exceptions import JWTError
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv


load_dotenv()


CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")

jwks_cache = None


async def get_jwks():
    global jwks_cache

    if jwks_cache:
        return jwks_cache

    if not CLERK_JWKS_URL:
        raise HTTPException(status_code=503, detail="Authentication is not configured")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(CLERK_JWKS_URL)
            response.raise_for_status()
            jwks_cache = response.json()
            return jwks_cache
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=503, detail="Authentication provider is unavailable") from None



async def verify_clerk_token(token: str):
    jwks = await get_jwks()
    try:
        token_header = jwt.get_unverified_header(token)
        signing_key = next(
            key for key in jwks.get("keys", [])
            if key.get("kid") == token_header.get("kid")
        )
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=None,
            issuer=CLERK_ISSUER
        )
        return payload
    except (JWTError, StopIteration, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Clerk token"
        ) from None