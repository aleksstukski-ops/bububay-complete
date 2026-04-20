from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./kleinanzeigen.db"
    jwt_secret: str
    account_credentials_key: str
    debug_reset_tokens: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
