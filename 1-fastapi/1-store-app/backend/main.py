import os
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

import models
import schemas
from database import SessionLocal, engine

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MetoStore API")

# Allow CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Setup ---
SECRET_KEY = "metostore_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.Store).filter(models.Store.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Store).filter(models.Store.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/stores/", response_model=schemas.Store)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    db_store = db.query(models.Store).filter(models.Store.username == store.username).first()
    if db_store:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(store.password)
    db_store = models.Store(username=store.username, store_name=store.store_name, hashed_password=hashed_password)
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

@app.get("/stores/me/", response_model=schemas.Store)
def read_users_me(current_user: models.Store = Depends(get_current_user)):
    return current_user

@app.get("/stores/{store_id}", response_model=schemas.Store)
def read_store(store_id: int, db: Session = Depends(get_db)):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if db_store is None:
        raise HTTPException(status_code=404, detail="Store not found")
    return db_store

@app.get("/stores/{store_id}/products/", response_model=List[schemas.Product])
def read_store_products(store_id: int, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.store_id == store_id).all()
    return products

@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.Store = Depends(get_current_user)):
    db_product = models.Product(**product.model_dump(), store_id=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.post("/stores/{store_id}/orders/", response_model=schemas.Order)
def create_order(store_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Verify product exists in store
    product = db.query(models.Product).filter(models.Product.id == order.product_id, models.Product.store_id == store_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found in this store")
    
    db_order = models.Order(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        product_id=order.product_id,
        store_id=store_id,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(db: Session = Depends(get_db), current_user: models.Store = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.store_id == current_user.id).all()
    return orders
