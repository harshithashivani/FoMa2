from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# tokenUrl is only used to populate FastAPI's auto-generated docs (the
# "Authorize" button at /docs) - the frontend calls /api/auth/login directly
# with JSON, not this OAuth2 form flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise unauthorized

    email = decode_access_token(token)
    if email is None:
        raise unauthorized

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise unauthorized
    return user


def require_role(*allowed_roles: str):
    """Dependency factory: raises 403 unless the current user's role is
    one of allowed_roles (case-insensitive). Usage:

        @router.post("/dangerous-action", dependencies=[Depends(require_role("Plant Manager"))])
    """
    allowed_lower = {r.lower() for r in allowed_roles}

    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.lower() not in allowed_lower:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return _check