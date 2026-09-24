from fastapi import Header, HTTPException

from database import supabase


def get_current_user_id(
    authorization: str = Header(...)
):

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header"
        )

    token = authorization.split(" ", 1)[1]

    try:
        response = supabase.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        return str(response.user.id)

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )