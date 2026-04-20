from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from models.database import Base
from config import settings
import bcrypt
import secrets
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET = settings.jwt_secret
ALGORITHM = "HS256"


class User(Base):
    __tablename__ = "app_users"
    id = __import__('sqlalchemy').Column(__import__('sqlalchemy').Integer, primary_key=True, autoincrement=True)
    username = __import__('sqlalchemy').Column(__import__('sqlalchemy').String(100), unique=True, nullable=False)
    password_hash = __import__('sqlalchemy').Column(__import__('sqlalchemy').String(200), nullable=False)
    is_admin = __import__('sqlalchemy').Column(__import__('sqlalchemy').Boolean, default=False)
    reset_token_hash = __import__('sqlalchemy').Column(__import__('sqlalchemy').String(200), nullable=True)
    reset_token_expires_at = __import__('sqlalchemy').Column(__import__('sqlalchemy').DateTime, nullable=True)
    created_at = __import__('sqlalchemy').Column(__import__('sqlalchemy').DateTime, default=lambda: datetime.now(timezone.utc))


async def init_auth_table():
    from main import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        result = await conn.execute(text("PRAGMA table_info(app_users)"))
        columns = {row[1] for row in result.fetchall()}

        if "reset_token_hash" not in columns:
            await conn.execute(text("ALTER TABLE app_users ADD COLUMN reset_token_hash VARCHAR(200)"))
        if "reset_token_expires_at" not in columns:
            await conn.execute(text("ALTER TABLE app_users ADD COLUMN reset_token_expires_at DATETIME"))


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


class ForgotPasswordReq(BaseModel):
    username: str


class ResetPasswordReq(BaseModel):
    token: str
    password: str
    password_confirm: str


def hash_pw(pw):
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_pw(pw, password_hash):
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def hash_reset_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_token(user_id, is_admin):
    return jwt.encode(
        {"sub": user_id, "admin": is_admin, "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        SECRET,
        algorithm=ALGORITHM,
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
    if len(data.password) < 8:
        raise HTTPException(400, "Passwort mind. 8 Zeichen")
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Username existiert bereits")

    user = User(
        username=data.username,
        password_hash=hash_pw(data.password),
        is_admin=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token(user.id, user.is_admin)
    return {"success": True, "token": token, "username": user.username}


@router.post("/login")
async def login(data: LoginReq, db: AsyncSession = Depends(get_session_dep)):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_pw(data.password, user.password_hash):
        raise HTTPException(401, "Falsche Zugangsdaten")

    token = create_token(user.id, user.is_admin)
    return {"success": True, "token": token, "username": user.username}


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordReq, db: AsyncSession = Depends(get_session_dep)):
    generic_response = {
        "success": True,
        "message": "Wenn das Konto existiert, wurde ein Reset vorbereitet."
    }

    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()

    if not user:
        return generic_response

    raw_token = secrets.token_urlsafe(32)
    user.reset_token_hash = hash_reset_token(raw_token)
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    await db.commit()

    if settings.debug_reset_tokens:
        return {
            **generic_response,
            "debug_token": raw_token
        }

    return generic_response


@router.post("/reset-password")
async def reset_password(data: ResetPasswordReq, db: AsyncSession = Depends(get_session_dep)):
    if len(data.password) < 8:
        raise HTTPException(400, "Passwort mind. 8 Zeichen")
    if data.password != data.password_confirm:
        raise HTTPException(400, "Passwoerter stimmen nicht ueberein")

    token_hash = hash_reset_token(data.token)
    result = await db.execute(select(User).where(User.reset_token_hash == token_hash))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token_expires_at:
        raise HTTPException(400, "Token ungueltig")

    expires_at = user.reset_token_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "Token abgelaufen")

    user.password_hash = hash_pw(data.password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    await db.commit()

    return {
        "success": True,
        "message": "Passwort wurde zurueckgesetzt. Bitte normal einloggen."
    }


@router.get("/me")
async def me(auth=Depends(auth_dep)):
    return {"authenticated": True, "user_id": auth["sub"], "admin": auth.get("admin", False)}
