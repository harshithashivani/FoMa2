from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str
    avatar_data: str | None = None


class AvatarUpdateRequest(BaseModel):
    avatar_data: str  # base64 data URI, e.g. "data:image/png;base64,...."


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut