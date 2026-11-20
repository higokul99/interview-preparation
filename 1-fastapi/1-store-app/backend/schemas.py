from pydantic import BaseModel
from typing import List, Optional

# --- Store ---
class StoreBase(BaseModel):
    username: str
    store_name: str

class StoreCreate(StoreBase):
    password: str

class Store(StoreBase):
    id: int
    class Config:
        orm_mode = True
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    store_id: int
    class Config:
        orm_mode = True
        from_attributes = True

# --- Order ---
class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    product_id: int

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    store_id: int
    status: str
    class Config:
        orm_mode = True
        from_attributes = True

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
