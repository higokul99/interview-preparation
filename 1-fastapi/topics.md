# FastAPI Interview Topics & Concept Checklist

> **Profile Context:** ~6 Years Python Backend Experience  
> **Resume Links:** Cisco CDR Platform (Flask to FastAPI migration), Voice AI Chatbot (FastAPI + LangGraph + ServiceNow), Store App (FastAPI + Next.js).

---

## 1. Core Framework Architecture & Concurrency
- [ ] **ASGI vs WSGI:** Difference between asynchronous server gateway interface (Uvicorn, Starlette) and WSGI (Gunicorn, Werkzeug).
- [ ] **`async def` vs `def` in Path Operations:**
  - How FastAPI handles `def` endpoints (offloaded to threadpool workers via `anyio.to_thread.run_sync`).
  - How `async def` endpoints run directly on the main event loop.
  - Blocking calls danger: Calling synchronous I/O (`requests.get`, `time.sleep`, synchronous DB drivers) inside `async def` blocks the event loop.
- [ ] **Event Loop & Asynchronous I/O (`asyncio`):** Tasks, Coroutines, `asyncio.gather()`, handling timeouts (`asyncio.wait_for()`), graceful shutdown events (`@asynccontextmanager` lifespan).

---

## 2. Request Handling, Validation & Pydantic (v1 vs v2)
- [ ] **Pydantic v2 Core:** Rust-based validation speedup, changes in syntax (`@field_validator`, `@model_validator(mode='before'/'after')`, `model_validate`, `model_dump`).
- [ ] **Parameter Parsing:** Query parameters, Path parameters, Request Body, Header, Cookie, Form, and File uploads.
- [ ] **Response Modeling:** `response_model`, `response_model_exclude_unset`, `response_model_exclude_none`, status codes, custom responses (`JSONResponse`, `StreamingResponse`).
- [ ] **Nested Schemas & Serialization:** Handling recursive schemas, ORM mode (`from_attributes = True`).

---

## 3. Dependency Injection System (`Depends`)
- [ ] **How `Depends()` Works:** Hierarchical dependency tree, execution order, caching (`use_cache=True`).
- [ ] **Yield Dependencies:** Context-managed dependencies for database sessions, cleanup execution (`try ... finally yield`).
- [ ] **Authentication & Security:**
  - `OAuth2PasswordBearer` and JWT token extraction/validation.
  - Role-Based Access Control (RBAC) dependencies parameterized via callable classes.
  - LDAP / Enterprise SSO integration patterns.

---

## 4. Database Integration & Async ORM
- [ ] **SQLAlchemy 2.0 Async:** `create_async_engine`, `async_sessionmaker`, `AsyncSession`.
- [ ] **Query Execution:** Modern `select()`, `update()`, `delete()` syntax vs legacy `session.query()`.
- [ ] **Handling Eager Loading:** `joinedload` (JOIN) vs `selectinload` (IN clause) to prevent the N+1 query problem in async sessions.
- [ ] **Connection Pooling:** Pool size, max overflow, pool recycle, connection timeouts, handling connection drops.
- [ ] **Transactions:** Explicit transactions (`async with session.begin():`) vs autocommit, rollback handling.

---

## 5. Middleware, Error Handling & Logging
- [ ] **Custom ASGI Middleware:** Creating custom middleware for request timing, correlation ID injection (`X-Request-ID`), structured logging.
- [ ] **Built-in Middleware:** `CORSMiddleware`, `GZipMiddleware`, `TrustedHostMiddleware`.
- [ ] **Global Exception Handlers:** Overriding `RequestValidationError`, handling `HTTPException`, custom domain exceptions mapped to clean API responses.
- [ ] **Background Tasks:** Built-in `BackgroundTasks` (runs after returning response) vs Celery/ARQ for heavy distributed processing.

---

## 6. Architecture, Design Patterns & Testing
- [ ] **Layered Architecture:**
  - **Routers / Controllers:** HTTP route definition, parameter extraction, response serialization.
  - **Services:** Pure business logic, transaction boundaries, orchestration.
  - **Repositories:** Data access layer, database queries, ORM isolation.
  - **Models / Schemas:** Pydantic DTOs vs Database Entities.
- [ ] **Testing:** `pytest`, `pytest-asyncio`, HTTPX `AsyncClient`, mocking DB sessions and external API dependencies (ServiceNow, LDAP).
- [ ] **OpenAPI / Swagger Customization:** Generating OpenAPI specs, configuring Swagger UI / ReDoc, adding security schemes.

---

## 7. Migration Case Study (Flask to FastAPI)
*Expect this direct question based on your Cisco CDR project!*
- [ ] **Why Migrate?** Performance gains through non-blocking asynchronous endpoints, automatic data validation with Pydantic, self-documenting interactive Swagger UI, modern typing.
- [ ] **Migration Strategy:** Route-by-route migration, handling state (`flask.g` vs FastAPI `Depends`), migrating Flask-SQLAlchemy to SQLAlchemy 2.0 / AsyncSession.
- [ ] **Production Deployment:** Gunicorn master managing Uvicorn worker processes (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`).

