from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone_id = Column(Integer, nullable=False)
    platform = Column(String(20), default="kleinanzeigen")
    is_active = Column(Boolean, default=True)
    # Echte Verbindung zu Kleinanzeigen
    email = Column(String(200), default="")
    password_encrypted = Column(String(500), default="")  # base64 encoded
    cookie_data = Column(Text, default="")  # Session cookies JSON
    session_active = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    location_city = Column(String(100), default="")
    location_plz = Column(String(10), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    amazon_url = Column(String(500), unique=True, nullable=False)
    title = Column(String(500), default="")
    brand = Column(String(200), default="")
    description = Column(Text, default="")
    price_original = Column(Float, default=0)
    price_set = Column(Float, default=0)
    price_type = Column(String(20), default="fixed")  # fixed, negotiable, give_away
    discount_percent = Column(Float, default=0)
    category = Column(String(200), default="")
    condition = Column(String(50), default="")  # neu, wie_neu, gut, akzeptabel
    shipping_type = Column(String(50), default="")  # versand, abholung, beides
    shipping_cost = Column(Float, default=0)
    location_city = Column(String(100), default="")
    location_plz = Column(String(10), default="")
    images = Column(JSON, default=list)
    status = Column(String(20), default="pending")  # pending, ready, listed, sold
    listed_at = Column(DateTime, nullable=True)
    sold_at = Column(DateTime, nullable=True)
    sold_price = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AccountAssignment(Base):
    __tablename__ = "account_assignments"
    product_id = Column(Integer, ForeignKey("products.id"), primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), primary_key=True)

class SellerShare(Base):
    __tablename__ = "seller_shares"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    seller_name = Column(String(100), nullable=False)
    percentage = Column(Float, default=100)
    amount = Column(Float, default=0)

class ListingSettings(Base):
    __tablename__ = "listing_settings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    default_discount_percent = Column(Float, default=10)
    default_price_type = Column(String(20), default="fixed")
    standard_text = Column(Text, default="Privater Verkauf - keine Garantie, keine Rücknahme. Versand möglich. Abholung jederzeit.")
    keywords = Column(Text, default="")
    default_condition = Column(String(50), default="wie_neu")
    default_shipping_type = Column(String(50), default="versand")
    default_shipping_cost = Column(Float, default=4.99)
