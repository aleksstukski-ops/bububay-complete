from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from models.database import Base
import hashlib, os

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET = os.environ.get("JWT_SECRET", "bubuanzeigen-secret-2024-v1")
ALGORITHM = "HS256"


class User(Base):
    __tablename__ = "app_users"
    id = __import__('sqlalchemy').Column(__import__('sqlalchemy').Integer, primary_key=True, autoincrement=True)
    username = __import__('sqlalchemy').Column(__import__('sqlalchemy').String(100), unique=True, nullable=False)
    password_hash = __import__('sqlalchemy').Column(__import__('sqlalchemy').String(200), nullable=False)
    is_admin = __import__('sqlalchemy').Column(__import__('sqlalchemy').Boolean, default=False)
    created_at = __import__('sqlalchemy').Column(__import__('sqlalchemy').DateTime, default=lambda: datetime.now(timezone.utc))


async def init_auth_table():
    from main import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session_dep():
    from main import async_session
    async with async_session() as session:
        yield session


class RegisterReq(BaseModel):
    username: str
    password: str

class LoginReq(BaseModel):
    username: str
    password: str


def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def create_token(user_id, is_admin):
    return jwt.encode(
        {"sub": user_id, "admin": is_admin, "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        SECRET, algorithm=ALGORITHM
    )

def verify_token(token):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Ungueltiger Token")

def auth_dep(authorization: str = ""):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Nicht eingeloggt")
    return verify_token(authorization[7:])


@router.post("/register")
async def register(data: RegisterReq, db: AsyncSession = Depends(get_session_dep)):
    if len(data.username) < 3:
        raise HTTPException(400, "Username mind. 3 Zeichen")
    if len(data.password) < 4:
        raise HTTPException(400, "Passwort mind. 4 Zeichen")
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Username existiert bereits")
    user = User(username=data.username, password_hash=hash_pw(data.password), is_admin=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_token(user.id, user.is_admin)
    return {"success": True, "token": token, "username": user.username}


@router.post("/login")
async def login(data: LoginReq, db: AsyncSession = Depends(get_session_dep)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or user.password_hash != hash_pw(data.password):
        raise HTTPException(401, "Falsche Zugangsdaten")
    token = create_token(user.id, user.is_admin)
    return {"success": True, "token": token, "username": user.username}


@router.get("/me")
async def me(auth=Depends(auth_dep)):
    return {"authenticated": True, "user_id": auth["sub"], "admin": auth.get("admin", False)}
