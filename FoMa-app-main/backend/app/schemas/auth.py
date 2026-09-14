from pydantic import BaseModel, ConfigDict, EmailStr, Field


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


class ProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut