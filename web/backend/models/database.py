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
    email = Column(String(200), default="")
    password_encrypted = Column(String(500), default="")  # encrypted with Fernet
    cookie_data = Column(Text, default="")
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
    price_type = Column(String(20), default="fixed")
    discount_percent = Column(Float, default=0)
    category = Column(String(200), default="")
    condition = Column(String(50), default="")
    shipping_type = Column(String(50), default="")
    shipping_cost = Column(Float, default=0)
    location_city = Column(String(100), default="")
    location_plz = Column(String(10), default="")
    images = Column(JSON, default=list)
    status = Column(String(20), default="pending")
    listed_at = Column(DateTime, nullable=True)
    sold_at = Column(DateTime, nullable=True)
    sold_price = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ProductMaster(Base):
    __tablename__ = "product_masters"
    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(100), unique=True, nullable=True)
    source_type = Column(String(50), default="")
    source_url = Column(String(1000), default="")
    source_reference = Column(String(255), default="")

    title = Column(String(500), default="")
    brand = Column(String(200), default="")
    description_short = Column(Text, default="")
    description_long = Column(Text, default="")
    category_hint = Column(String(200), default="")
    condition = Column(String(50), default="")
    condition_notes = Column(Text, default="")

    cost_price = Column(Float, default=0)
    target_price = Column(Float, default=0)
    min_price = Column(Float, default=0)
    max_price = Column(Float, default=0)
    currency = Column(String(10), default="EUR")

    shipping_mode = Column(String(50), default="")
    shipping_cost = Column(Float, default=0)
    location_city = Column(String(100), default="")
    location_plz = Column(String(10), default="")

    quantity_total = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)
    quantity_available = Column(Integer, default=0)

    status = Column(String(20), default="draft")

    restricted_product_flag = Column(Boolean, default=False)
    brand_risk_flag = Column(Boolean, default=False)
    manual_review_required = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class ProductMedia(Base):
    __tablename__ = "product_media"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_master_id = Column(Integer, ForeignKey("product_masters.id"), nullable=False)
    media_type = Column(String(20), default="image")
    source_url = Column(String(1000), default="")
    stored_url = Column(String(1000), default="")
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ChannelListing(Base):
    __tablename__ = "channel_listings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_master_id = Column(Integer, ForeignKey("product_masters.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    channel_name = Column(String(50), nullable=False)
    external_listing_id = Column(String(255), default="")
    external_url = Column(String(1000), default="")
    status = Column(String(20), default="draft")

    remote_price = Column(Float, default=0)
    remote_quantity = Column(Integer, default=0)

    last_sync_at = Column(DateTime, nullable=True)
    last_push_at = Column(DateTime, nullable=True)
    last_error = Column(Text, default="")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


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
