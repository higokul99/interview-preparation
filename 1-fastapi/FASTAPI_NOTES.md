# FastAPI Concept and Interview Preparation Notes

These notes explain how FastAPI works, why its design choices matter, and how to discuss them in backend interviews. Examples connect to the adjacent `1-store-app` project. Read alongside [the topic checklist](topics.md), then practice explaining the tradeoffs without looking at the answers.

Examples use Python 3.10+ syntax and Pydantic v2. `asyncio.TaskGroup` and `asyncio.timeout` require Python 3.11+. The store application's requirements declare FastAPI 0.141.1, Pydantic 2.13.4, and SQLAlchemy 2.0.52; these are declared dependencies, not a statement about what is installed locally. Version-sensitive guidance was checked against official documentation on November 20, 2026.

## Contents

1. [Framework architecture](#1-framework-architecture)
2. [A request from start to finish](#2-a-request-from-start-to-finish)
3. [A runnable first example](#3-a-runnable-first-example)
4. [Parameters and HTTP semantics](#4-parameters-and-http-semantics)
5. [Pydantic validation](#5-pydantic-validation)
6. [Response contracts](#6-response-contracts)
7. [Concurrency and async](#7-concurrency-and-async)
8. [Dependency injection](#8-dependency-injection)
9. [Database sessions and transactions](#9-database-sessions-and-transactions)
10. [Async SQLAlchemy and query performance](#10-async-sqlalchemy-and-query-performance)
11. [Authentication and authorization](#11-authentication-and-authorization)
12. [Errors and middleware](#12-errors-and-middleware)
13. [CORS](#13-cors)
14. [Lifespan and resource ownership](#14-lifespan-and-resource-ownership)
15. [Background work and real-time APIs](#15-background-work-and-real-time-apis)
16. [Application architecture](#16-application-architecture)
17. [Testing](#17-testing)
18. [Deployment and performance](#18-deployment-and-performance)
19. [Learning from the store application](#19-learning-from-the-store-application)
20. [Flask migration interview discussion](#20-flask-migration-interview-discussion)
21. [Interview questions and model answers](#21-interview-questions-and-model-answers)
22. [Exercises and revision plan](#22-exercises-and-revision-plan)

## 1. Framework architecture

FastAPI is a Python framework for building APIs using type annotations. It combines request parsing, validation, dependency injection, response serialization, and OpenAPI generation. It does not provide a database or ORM by itself.

Understand the separate responsibilities:

- **FastAPI:** API declarations, dependency resolution, validation integration, and API documentation.
- **Starlette:** underlying ASGI web capabilities, including routing primitives, middleware, responses, and WebSockets.
- **Pydantic:** structured data validation and serialization.
- **Uvicorn:** the server that accepts connections and invokes the ASGI application.
- **SQLAlchemy:** optional database toolkit and ORM used by your store app.

Python normally does not enforce type hints. FastAPI examines endpoint signatures and uses the declared information to build runtime validation and documentation. The same type hint in an ordinary Python function does not automatically validate its arguments.

**ASGI versus WSGI:** Both define a boundary between Python servers and applications. WSGI uses a synchronous request/response calling convention. ASGI uses asynchronous event messages and supports protocols such as WebSockets and application lifespan. WSGI deployments can still serve concurrent requests through threads or processes; ASGI does not make blocking code nonblocking.

**Interview answer:** “FastAPI gives me typed API contracts and dependency injection on an ASGI stack. Its concurrency benefits depend on the endpoint and the libraries it calls.”

References: [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/) and [Uvicorn](https://uvicorn.dev/).

## 2. A request from start to finish

For the store app's protected `POST /products/`, think through this sequence:

1. The server receives the HTTP request and passes it into the application.
2. Middleware wraps request processing, for example applying CORS behavior.
3. Routing selects the endpoint using the URL and HTTP method.
4. FastAPI extracts inputs, resolves dependencies, and validates declared values. Dependency resolution and validation interact; do not assume every input is validated before any dependency executes.
5. The bearer dependency extracts a token; `get_current_user` verifies it and loads the store.
6. The endpoint constructs a product with the authenticated store's ID, then commits it.
7. The response model validates and serializes the result into the public product representation.
8. The response travels back through middleware. Resource cleanup follows the configured dependency scope.

The separation matters during debugging. A `422` usually means request validation rejected input. A `401` points to authentication. A database failure occurs later. A response validation failure indicates that server output violates its own contract.

## 3. A runnable first example

Save this example as `main.py` in a separate practice directory. It is independent of the store app.

```python
from typing import Annotated

from fastapi import FastAPI, Path, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Product Practice API")


class ProductCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)


class ProductRead(ProductCreate):
    id: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products/{product_id}")
def read_product(
    product_id: Annotated[int, Path(gt=0)],
    include_stock: bool = False,
):
    return {"id": product_id, "include_stock": include_stock}


@app.get("/products")
def list_products(limit: Annotated[int, Query(ge=1, le=100)] = 20):
    return {"limit": limit, "items": []}


@app.post("/products", response_model=ProductRead, status_code=201)
def create_product(product: ProductCreate):
    return ProductRead(id=1, **product.model_dump())
```

Run from that practice directory:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install fastapi uvicorn
python -m uvicorn main:app --reload
```

`main:app` means “import the `app` object from the `main` module.” Visit `http://127.0.0.1:8000/docs` for Swagger UI, `/redoc` for alternative documentation, and `/openapi.json` for the API schema.

```bash
curl -X POST http://127.0.0.1:8000/products \
  -H 'Content-Type: application/json' \
  -d '{"title":"Keyboard","price":49.5}'
```

Expected: `201` with an ID, title, and price. A negative price produces `422`. This demonstration does not persist products; the fixed ID makes the example deliberately small.

## 4. Parameters and HTTP semantics

### Where values come from

- **Path:** resource identity, such as `/products/42`. A parameter matching `{product_id}` comes from the path.
- **Query:** filtering, sorting, or pagination, such as `?limit=20`. Ordinary scalar parameters not in the path are generally query parameters unless explicitly declared otherwise.
- **Body:** structured input, commonly a Pydantic model containing JSON fields.
- **Header:** metadata such as a request ID, declared using `Header()`.
- **Cookie:** a browser cookie, declared using `Cookie()`.
- **Form:** form-encoded input, declared using `Form()`; the store app's token endpoint expects username/password form fields.
- **File:** multipart uploads, normally through `UploadFile` and `File()`.

`Annotated[int, Query(ge=1)]` keeps the Python type separate from FastAPI metadata. Parameter names alone do not identify headers or cookies. A scalar JSON body can be explicitly declared using `Body()`.

References: [Request bodies](https://fastapi.tiangolo.com/tutorial/body/) and [parameter constraints](https://fastapi.tiangolo.com/tutorial/query-params-str-validations/).

### HTTP design decisions

Use `GET` for retrieval, `POST` for creation or commands, `PUT` for replacement semantics, `PATCH` for partial updates, and `DELETE` for deletion. FastAPI does not implement these business semantics for you.

**Idempotency** means repeating the same request has the same intended server-state effect. Repeated DELETE requests can return different status codes while still being idempotent. POST order creation often needs an idempotency key to avoid duplicate orders after client retries.

Useful status codes:

- `200`: successful response with content.
- `201`: resource created; optionally include its URL in a `Location` header.
- `202`: work accepted but not yet finished.
- `204`: success without a response body.
- `400`: malformed request or a documented application-level rejection.
- `401`: authentication missing or invalid; bearer authentication normally includes `WWW-Authenticate: Bearer`.
- `403`: the authenticated caller lacks permission.
- `404`: requested resource unavailable or intentionally undisclosed.
- `409`: conflict with current state, such as a duplicate unique username.
- `422`: FastAPI's default request validation failure.
- `429`: rate limit exceeded.
- `500`: unexpected server failure.

Register specific routes such as `/stores/me` before a matching dynamic route such as `/stores/{store_id}`. Otherwise the dynamic route can match `me`, and integer validation can fail.

### File uploads

`bytes` loads the uploaded content into memory. `UploadFile` exposes a spooled file, useful when files exceed a small memory threshold. Multipart requests cannot simultaneously be treated as an ordinary JSON body; send metadata as form fields or design a separate upload flow. Install `python-multipart` for forms and uploads. Impose size limits and inspect file content rather than trusting filenames or MIME headers. [File upload documentation](https://fastapi.tiangolo.com/tutorial/request-files/).

## 5. Pydantic validation

### Required is different from nullable

```python
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    price: float = Field(gt=0)

    @field_validator("title")
    @classmethod
    def reject_blank_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("title must not be blank")
        return value
```

Compare these declarations in Pydantic v2:

- `name: str`: required and cannot be null.
- `name: str | None`: required, but null is allowed.
- `name: str | None = None`: may be omitted and may be null.

Pydantic can coerce compatible values; strict validation must be requested where needed. `extra="forbid"` rejects unknown fields instead of silently ignoring them. Nested Pydantic models describe nested request structures.

### Pydantic v2 vocabulary

- `model_validate(data)` validates data into a model.
- `model_dump()` produces a Python dictionary; it does not necessarily contain only JSON-native values.
- `model_dump(mode="json")` produces JSON-compatible values.
- `model_dump_json()` returns a JSON string.
- `ConfigDict(from_attributes=True)` enables reading object attributes, useful for ORM results.
- `field_validator` handles field rules; `model_validator` handles rules involving multiple fields.

Older tutorials use `.dict()`, `.parse_obj()`, `orm_mode`, and `@validator`. Prefer the v2 equivalents above. [Pydantic migration guide](https://docs.pydantic.dev/latest/migration/).

### Input validation versus business correctness

“Price must be positive” belongs in input validation. “This store owns this product” requires authenticated identity and database state. “Username must be unique” requires a database constraint because two requests can pass the same pre-check concurrently.

For money, choose integer minor units or `Decimal` with a matching database numeric type and explicit currency/rounding rules. A binary float cannot represent every decimal amount exactly. Merely replacing the request type while retaining a floating-point database column does not fix the full data path.

## 6. Response contracts

Separate create, update, and read schemas because clients are allowed to send and receive different fields. A store registration request needs a password; a public store response must not expose either the password or its hash.

`response_model` documents output, validates it, and filters undeclared fields during normal serialization. Invalid server output is a server error, not a client `422`. Returning a `Response` object directly bypasses normal response-model processing, so it needs deliberate handling. [Response model documentation](https://fastapi.tiangolo.com/tutorial/response-model/).

For PATCH, distinguish an omitted field from an explicitly supplied null:

```python
from pydantic import BaseModel


class ProductPatch(BaseModel):
    description: str | None = None


omitted = ProductPatch()
clear_description = ProductPatch(description=None)

assert omitted.model_dump(exclude_unset=True) == {}
assert clear_description.model_dump(exclude_unset=True) == {"description": None}
```

Apply only permitted keys from `model_dump(exclude_unset=True)`. `exclude_none=True` removes nulls and would lose a client's explicit instruction to clear a nullable field. Response exclusion options control serialization; they do not automatically redefine every aspect of the documented schema.

## 7. Concurrency and async

### What actually executes where

An `async def` endpoint runs on the worker's event loop. A normal `def` endpoint or dependency called by FastAPI runs in a thread pool. A synchronous helper called directly from an async endpoint is still an ordinary direct call: FastAPI does not automatically offload it.

`await` allows cooperative suspension while an awaitable is waiting. It does not create a new thread and does not guarantee a context switch at every occurrence. Use async endpoints with async I/O libraries; use synchronous endpoints for blocking I/O libraries or explicitly offload a bounded blocking operation. [FastAPI concurrency guide](https://fastapi.tiangolo.com/async/).

Bad: `async def` plus `time.sleep(2)` or a synchronous network request blocks the loop. Better for an asynchronous delay: `await asyncio.sleep(2)`.

**Concurrency** overlaps progress, especially waiting. **Parallelism** performs work simultaneously, usually across cores/processes. CPU-heavy Python code can still block an async endpoint; moving it to a thread may protect the loop but does not generally provide CPU parallelism on a conventional GIL-enabled interpreter. Use worker processes or a compute service when appropriate.

### Concurrent downstream calls

Conceptual example: `fetch_price` and `fetch_stock` below represent existing async client functions.

```python
import asyncio


async def product_summary(fetch_price, fetch_stock):
    async with asyncio.timeout(2):
        async with asyncio.TaskGroup() as group:
            price_task = group.create_task(fetch_price())
            stock_task = group.create_task(fetch_stock())
    return {"price": price_task.result(), "stock": stock_task.result()}
```

TaskGroup waits for its children and cancels siblings when a child fails with an ordinary exception. `gather()` has different default failure behavior: propagating the first exception does not automatically cancel remaining children. Always define timeouts and cancellation behavior; use `finally` for resource cleanup and avoid swallowing cancellation. [Python task documentation](https://docs.python.org/3/library/asyncio-task.html).

**Interview scenario:** Two independent external calls each take 300 ms. Sequential execution adds roughly 600 ms; overlapping them can approach 300 ms plus overhead. This assumes the upstream services and connection pool have capacity. Unbounded fan-out can overload dependencies, so use limits and backpressure.

## 8. Dependency injection

`Depends` declares what an endpoint needs. FastAPI resolves the dependency graph and injects results. Common dependencies supply a session, authenticated identity, tenant, pagination rules, or a configured client.

```python
from typing import Annotated
from fastapi import Depends, FastAPI, Query

app = FastAPI()


def pagination(
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return {"limit": limit, "offset": offset}


@app.get("/products")
def products(page: Annotated[dict, Depends(pagination)]):
    return page
```

Use `Depends(pagination)`, passing the function, not `Depends(pagination())`, which calls it immediately. Dependencies can have subdependencies. Repeated use of the same dependency is normally cached within a request, not across requests; `use_cache=False` disables reuse for that declaration. This is not a database or distributed cache. [Dependency injection](https://fastapi.tiangolo.com/tutorial/dependencies/).

### Dependencies with yield

The store app uses this resource pattern:

```python
# SessionLocal is the configured SQLAlchemy session factory.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Code before `yield` acquires the resource; the yielded value is injected; `finally` releases it even if request processing raises an exception. Closing a session is not a substitute for committing a successful transaction.

In modern FastAPI, a yield dependency defaults to request scope, with cleanup after the response is sent. `Depends(get_db, scope="function")` requests earlier cleanup after the endpoint finishes and before the response is sent. Early cleanup is unsuitable when streaming still needs that resource. Do not commit critical writes in cleanup after a successful response is already sent. [Yield dependencies and scope](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/).

**Why DI helps tests:** Replace a dependency with a fake through `app.dependency_overrides` without changing the endpoint. Calling the dependency manually inside the endpoint bypasses this resolution mechanism.

## 9. Database sessions and transactions

An **engine** manages database connectivity and pooling. A **connection** communicates with the database. A **session** tracks ORM objects and a unit of work. A **transaction** groups changes that succeed or fail together.

Use sessions with bounded ownership, typically one per request or business operation. Do not put one mutable session in a global variable and share it among requests.

- `add()` places an object into the session.
- `flush()` sends pending changes inside the transaction; it does not commit them.
- `commit()` finalizes the transaction and normally flushes first.
- `refresh()` reloads an object's attributes from the database.
- `rollback()` abandons a failed transaction; it is required before reusing a session after certain flush failures.
- `close()` releases session resources.

SQLAlchemy can begin transactions automatically when work starts; that is **autobegin**, not autocommit. [SQLAlchemy session basics](https://docs.sqlalchemy.org/en/20/orm/session_basics.html).

### Where should commit happen?

Consider “create order, reserve stock, record payment attempt.” If each repository commits separately, the first change can persist while a later change fails. Let a service or unit-of-work boundary own the complete transaction. Keep network calls outside long database transactions where practical; distributed side effects need reconciliation or an outbox/workflow design.

The store app checks whether a username exists before insertion. Keep the database unique constraint too: simultaneous requests can both see “not found.” Catch the relevant integrity error, roll back, and translate the specific duplicate violation to a stable API error. Do not treat every database exception as a duplicate username.

`create_all()` helps create missing tables for a demonstration. It does not provide a versioned schema evolution workflow. Use migrations, such as Alembic, for controlled production schema changes.

## 10. Async SQLAlchemy and query performance

Async database access requires an async engine, a compatible async driver, and async session usage. Renaming a function to `async def` does not convert a synchronous database driver.

Illustrative PostgreSQL setup; this requires an async driver such as `asyncpg` and a real database URL:

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine("postgresql+asyncpg://user:password@localhost/store")
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_db():
    async with SessionFactory() as session:
        yield session


async def find_product(session, product_model, product_id):
    statement = select(product_model).where(product_model.id == product_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()
```

`async with session.begin():` scopes a transaction, committing on normal exit and rolling back on error. Start that boundary before operations that autobegin a transaction. An `AsyncSession` is mutable transaction state: do not share it across concurrent tasks. Async lazy-loading can attempt unexpected I/O; explicitly load attributes needed for serialization. [SQLAlchemy async guide](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html).

### The N plus 1 problem

Loading 50 stores and lazily fetching each store's products can cause one store query plus 50 product queries. `selectinload` retrieves relationships with additional batched queries; `joinedload` joins related rows into the main query. Joined collections can multiply rows and require `Result.unique()` for ORM results. Choose using query count, row volume, and pagination behavior, not a universal rule. [Relationship loading](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html).

### Pooling and pagination

Pool size bounds reusable connections; overflow permits temporary additional connections for pools that support it. Waiting for a pool slot can dominate latency. Multiple server processes each have their own engine/pool, so total database connections multiply with workers and replicas.

Offset pagination is easy but large offsets can be expensive and concurrent inserts can shift pages. Cursor pagination uses a stable ordering and continuation key, often a timestamp plus ID. Validate page size and sorting fields, and index actual filter/order combinations.

## 11. Authentication and authorization

**Authentication** establishes identity. **Authorization** decides which actions that identity may perform. A valid token alone does not authorize access to every store's orders.

The store app's authentication flow is:

1. A client sends username/password form data to `/token`.
2. The server finds the store and verifies the password against its stored hash.
3. The server signs an access token containing a subject (`sub`) and expiration (`exp`).
4. The client sends `Authorization: Bearer <token>` to protected endpoints.
5. `OAuth2PasswordBearer` extracts the bearer token. Application code must verify the signature and claims and load/check the user.

A signed JWT provides integrity, not confidentiality: its payload is normally readable. Do not put passwords or secrets inside it. Decode with explicitly allowed algorithms and validate the claims your application requires. An expiration claim must be required if the application promises all accepted tokens expire; validating expiration when present is not the same as requiring its presence. [FastAPI JWT tutorial](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/).

### Authorization design

For store-owned data, filter with both the resource ID and the authenticated store ID. Taking `store_id` from arbitrary request input and trusting it creates a cross-tenant access risk.

Role checks answer “is this user an administrator?” Ownership checks answer “does this specific product belong to this store?” Many endpoints need both. A reusable role dependency can be implemented as a callable object with `__call__`, configured with allowed roles; it should raise `403` when permission is missing.

For enterprise identity, an external identity provider can handle login through OIDC, while the API validates access tokens intended for it. LDAP is a directory protocol, not an interchangeable name for OAuth or JWT. If LDAP access is synchronous, account for blocking I/O. Keep identity-provider integration behind a dependency or service interface so tests do not depend on a live directory.

### Security decisions to explain in interviews

- Store password hashes using an appropriate password-hashing library, never reversible encryption or plaintext.
- Keep signing keys and database credentials outside source code. Define rotation and environment separation.
- Use HTTPS because bearer-token possession grants access.
- Decide how account suspension and token revocation take effect; a self-contained token does not automatically disappear on logout.
- Keep access tokens short-lived according to application needs. Refresh-token storage, rotation, and reuse detection are separate responsibilities.
- Browser token storage has tradeoffs: JavaScript-accessible storage is exposed to script compromise; automatically sent cookies require CSRF considerations and appropriate cookie attributes.
- Do not log authorization headers, passwords, or full tokens.

## 12. Errors and middleware

Raise `HTTPException` to stop request processing with a deliberate HTTP error; do not return the exception object. Use custom exception handlers to map domain errors into stable public responses. Invalid request data raises `RequestValidationError`; output validation failures are server defects. [Error handling](https://fastapi.tiangolo.com/tutorial/handling-errors/).

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


class OutOfStock(Exception):
    pass


@app.exception_handler(OutOfStock)
async def handle_out_of_stock(request: Request, exc: OutOfStock):
    return JSONResponse(
        status_code=409,
        content={"code": "OUT_OF_STOCK", "message": "Insufficient stock"},
    )
```

**Middleware** surrounds requests across routes. Use it for request IDs, timing, and cross-cutting headers. **Dependencies** suit route-aware requirements such as a current user, a role, or a database session. **Exception handlers** translate failures into responses. These mechanisms overlap in capability but have different responsibilities.

A request ID should appear in structured logs and, when appropriate, response headers. Measure dependency latency separately from total request time. Timing only `await call_next(request)` may not include consumption of an entire streamed response; define what your metric measures.

Middleware order matters because layers nest. Avoid routinely reading large request/response bodies for logging. This can consume memory, expose sensitive information, and interfere with streaming.

## 13. CORS

CORS is a browser rule governing whether JavaScript from one origin can access responses from another. An origin includes scheme, host, and port: `http://localhost:3000` and `http://localhost:8000` are different origins.

Use explicit allowed origins for a credentialed browser application:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

Browsers may send an `OPTIONS` preflight before the actual request. Wildcard configuration is unsuitable for a credentialed setup; list the relevant origins, methods, and headers. CORS is not authentication and does not prevent a command-line client from calling the API. [CORS documentation](https://fastapi.tiangolo.com/tutorial/cors/).

## 14. Lifespan and resource ownership

Use lifespan to acquire shared resources at application startup and release them at shutdown. Examples include an HTTP client pool or a model loaded into memory. The code below requires `httpx` in addition to FastAPI:

```python
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient(timeout=5.0) as client:
        app.state.http_client = client
        yield


app = FastAPI(lifespan=lifespan)
```

Before `yield`: startup. After `yield` and context exit: shutdown cleanup. Prefer lifespan over older startup/shutdown event decorators for new code. When lifespan is supplied, do not expect the old event handlers to run alongside it. [Lifespan documentation](https://fastapi.tiangolo.com/advanced/events/).

Distinguish ownership levels: an engine or HTTP connection pool can be application-scoped; a transaction session is operation-scoped; the current user's identity is request-scoped. Each server worker has its own lifespan and memory. Startup code should not assume it executes once across an entire deployment.

## 15. Background work and real-time APIs

### BackgroundTasks versus a job queue

`BackgroundTasks` schedules work after the response has been sent, in the same application process. It is suitable for short, best-effort work. It does not provide durable storage, distributed scheduling, retry management, or survival across process crashes. A failed background action cannot change an already delivered success response. [Background task documentation](https://fastapi.tiangolo.com/tutorial/background-tasks/).

For order processing, generate a durable job record or publish to a reliable queue and return `202` with a status URL. A worker handles retries, idempotency, and failures. A transactional outbox can close the gap between “database committed” and “job published.”

Pass IDs or immutable values to background work and let it acquire its own session. Do not pass a request session or assume a request-scoped ORM object will remain usable.

### Streaming, SSE, and WebSockets

- **StreamingResponse:** incrementally sends response chunks, useful for large or generated content. Resources must remain valid during iteration.
- **Server-Sent Events:** a server-to-browser event stream over HTTP, useful for progress or token delivery when the client does not need a full duplex channel.
- **WebSockets:** a long-lived bidirectional connection, useful for interactive sessions such as voice or chat.

WebSocket code accepts a connection, receives/sends messages, and handles disconnects. Authentication, message validation, timeouts, and backpressure remain application responsibilities. In-memory connection registries work only within one process; cross-worker delivery needs shared messaging. [WebSocket documentation](https://fastapi.tiangolo.com/advanced/websockets/).

## 16. Application architecture

For a growing store backend, a possible structure is:

```text
app/
  main.py
  api/
    products.py
    orders.py
  schemas/
    product.py
    order.py
  models/
    product.py
    order.py
  services/
    order_service.py
  repositories/
    product_repository.py
  dependencies.py
  database.py
  settings.py
tests/
```

`APIRouter` groups endpoints by domain and supports prefixes, tags, and shared dependencies. Register it with `app.include_router(router)`. Router-level dependencies can enforce authentication even when their returned values are not needed by handlers. [Bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/).

Keep responsibilities clear:

- **Router:** translate HTTP input/output and invoke the use case.
- **Schema:** define public data shape and validation.
- **Service:** enforce business rules and coordinate transactions.
- **Repository:** encapsulate database queries when doing so adds useful structure.
- **ORM model:** represent database tables and relationships.

Avoid adding layers that merely forward identical arguments without simplifying ownership or testing. For a small service, thin routes plus focused business functions may be enough.

OpenAPI is a machine-readable contract, while Swagger UI is a viewer for that contract. Document success and error responses, authentication requirements, tags, and stable operation names. Contract changes can break generated clients even if the endpoint URL remains unchanged.

## 17. Testing

### A small executable test

For the standalone example in section 3, save this as `test_main.py` beside its `main.py`. Install `pytest` and `httpx`, then run `python -m pytest`.

```python
from fastapi.testclient import TestClient
from main import app


def test_create_product():
    with TestClient(app) as client:
        response = client.post(
            "/products", json={"title": "Keyboard", "price": 49.5}
        )
    assert response.status_code == 201
    assert response.json() == {"id": 1, "title": "Keyboard", "price": 49.5}


def test_reject_negative_price():
    with TestClient(app) as client:
        response = client.post(
            "/products", json={"title": "Keyboard", "price": -1}
        )
    assert response.status_code == 422
    assert any(error["loc"][-1] == "price" for error in response.json()["detail"])
```

`TestClient` makes synchronous calls against the ASGI app. Its context-manager form runs lifespan. [Testing guide](https://fastapi.tiangolo.com/tutorial/testing/).

For tests that await async database or client calls, use HTTPX `AsyncClient` with `ASGITransport` and an async test runner. ASGITransport alone does not trigger lifespan; manage lifespan explicitly when the test depends on startup resources. [Async testing guide](https://fastapi.tiangolo.com/advanced/async-tests/).

### Tests with the highest value for the store app

1. A valid store registration never returns `password` or `hashed_password`.
2. Missing, malformed, expired, and incorrectly signed tokens are rejected.
3. Store A cannot list or mutate Store B's private orders/products.
4. An order cannot reference a product belonging to another store.
5. Duplicate registration respects the database uniqueness constraint.
6. Invalid prices, blank names, and malformed emails fail validation once those rules are added.
7. A failed multi-step operation leaves no partial database state.
8. Pagination limits and empty results have documented behavior.

Override dependencies through `app.dependency_overrides[original_function] = fake_function`, and restore overrides in `finally` or fixture teardown. Use a dedicated test database with a deliberate cleanup strategy. Repository integration tests should exercise actual database constraints, not only mocked sessions.

## 18. Deployment and performance

For local development:

```bash
python -m uvicorn main:app --reload
```

For a simple multi-process deployment, with worker count chosen by measurement:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

Do not combine `--reload` and `--workers`. Older examples use Gunicorn's `uvicorn.workers.UvicornWorker`; that module is deprecated. If using Gunicorn, use the separately maintained `uvicorn-worker` package and its `uvicorn_worker.UvicornWorker` class. [Uvicorn deployment guidance](https://uvicorn.dev/deployment/).

A worker is a separate process with its own application state, database pool, and memory. More workers can improve capacity but also multiply RAM usage and database connections. Container deployments may instead use one worker per container and scale replicas. [Deployment concepts](https://fastapi.tiangolo.com/deployment/concepts/).

### Diagnose performance before changing worker counts

Ask where time is spent: waiting for a database connection, executing SQL, waiting for an upstream API, blocking the event loop, validating a huge payload, or serializing excessive data. Measure p50/p95/p99 latency, error rate, request rate, pool utilization, query count, and event-loop delay.

Use representative load. A very fast `/health` endpoint tells little about a protected endpoint issuing several database queries. A synchronous application migrated unchanged to FastAPI may gain schema clarity without gaining I/O concurrency.

Operational concerns include graceful shutdown, bounded timeouts, trusted proxy configuration, health/readiness checks, secret configuration, and running migrations as a controlled deployment step. In-memory rate limits and caches are per process; use shared storage when consistency across workers matters.

## 19. Learning from the store application

These observations describe the source in `1-store-app/backend` when the notes were written. They are study points, not changes applied to the application.

### What the current implementation demonstrates

- [`main.py`](1-store-app/backend/main.py): routes, dependency injection, token login, authentication, and ownership filtering.
- [`schemas.py`](1-store-app/backend/schemas.py): separate input and output Pydantic models.
- [`database.py`](1-store-app/backend/database.py): SQLAlchemy engine and session factory.
- [`models.py`](1-store-app/backend/models.py): tables, foreign keys, relationships, and username uniqueness.

### Important refinements to explain

**Blocking work in an async dependency:** `get_current_user` is `async def` but calls synchronous `db.query(...).first()`. That query executes on the event loop even when the endpoint itself uses `def`. A synchronous dependency would let FastAPI offload it; an alternative is converting the entire database path to a compatible async stack.

**Pydantic configuration:** Schemas contain both `orm_mode` and `from_attributes` inside class-based `Config`. Use `model_config = ConfigDict(from_attributes=True)` consistently for v2. The output schema should continue excluding the stored password hash.

**Input rules:** `price` is an unconstrained float and `customer_email` is a plain string. Positive-value rules, a money representation, and email validation require explicit choices. `EmailStr` needs the optional email validation dependency.

**Credentials and timestamps:** The JWT key is hard-coded in `main.py`. Move it to external configuration. Prefer timezone-aware UTC timestamps, such as `datetime.now(timezone.utc)`, for new token-generation code.

**CORS:** The wildcard origin/method/header setup plus credentials should be replaced with an explicit browser policy for the intended frontend origins.

**Schema changes:** Table creation at module import is convenient for a prototype but should not be treated as a migration strategy.

**Transactions and duplicate usernames:** The pre-check helps return a friendly error, but the unique constraint resolves races. Handle the expected integrity violation and roll back.

**Ownership already present:** Product creation assigns `store_id=current_user.id`; order listing filters on that identity; order creation verifies that the product belongs to the requested store. These are useful examples of server-side ownership rules.

**Public endpoints:** Store lookup, product listing, and order creation do not currently require login. That may fit a public storefront; explain the product requirement before labeling it a bug. Abuse controls and privacy decisions still need design.

**Growth considerations:** Product/order listing is unbounded, and creation routes use the default success status. Add bounded pagination and deliberately choose whether successful creation should return `201`.

## 20. Flask migration interview discussion

Use this structure when discussing a migration you actually performed. Do not invent performance numbers or claim that every step below happened on a previous project.

1. **Problem:** Explain the concrete pain: inconsistent validation, difficult client contracts, slow downstream I/O, or duplicated request setup.
2. **Decision:** Explain why typed schemas, dependencies, and ASGI fit the workload. A framework migration alone does not fix slow SQL.
3. **Compatibility:** Capture existing routes, payload shapes, status codes, headers, authentication, and error behavior with contract tests.
4. **Incremental delivery:** Move a limited group of routes, preserving compatibility or deliberately versioning breaking changes.
5. **State migration:** Replace relevant `flask.g` patterns with request dependencies or request state. Use application state/lifespan for shared clients.
6. **Concurrency:** Inventory blocking libraries. Keep a synchronous path where appropriate and migrate I/O deliberately.
7. **Validation:** Pydantic may reject values the previous API accepted; treat that as a contract change to evaluate.
8. **Operations:** Compare equivalent traffic, inspect tail latency and errors, and retain a rollback path.

**Sample answer:** “I would first preserve the API contract and migrate one vertical slice. Then I would measure its actual bottlenecks. Async would be introduced where waiting on supported I/O dominates, while transaction boundaries and failure behavior remain explicit.”

## 21. Interview questions and model answers

### Fundamentals

**1. Why choose FastAPI?** Typed request/response contracts, validation, dependency injection, OpenAPI integration, and an ASGI foundation. Evaluate ecosystem and team requirements; do not promise universal performance superiority.

**2. Is FastAPI the server?** No. FastAPI builds the application; an ASGI server such as Uvicorn serves it.

**3. Do Python type hints enforce types?** Not by themselves. FastAPI and Pydantic interpret the declarations at runtime.

**4. Is an optional type an optional field?** Not necessarily. In Pydantic v2, `str | None` allows null but still requires a value unless a default is provided.

**5. Why separate response schemas?** Public output should have its own contract, independent of input fields and internal database attributes.

### Concurrency and dependencies

**6. Why can an async endpoint be slow for every caller?** Blocking work can occupy the event loop, preventing other tasks in the same worker from making progress.

**7. Does await make two calls concurrent?** Sequentially awaiting each call still sequences them. Schedule independent operations together when safe, with bounded concurrency.

**8. Does a def endpoint block the event loop?** FastAPI offloads that endpoint, but the finite thread pool and downstream resources can still saturate.

**9. Why use yield for a database dependency?** It expresses acquisition and reliable cleanup around the dependency's scope. Transaction success must still be decided explicitly.

**10. Is dependency caching shared across users?** Default dependency-result reuse is within a request. It is not a process-wide user cache.

### Databases and correctness

**11. Why not share a session globally?** Sessions hold mutable transaction and identity-map state. Concurrent requests would interfere with one another.

**12. Does async make a SQL query faster?** It primarily changes how the application waits. Query plans, indexes, locking, and database load determine database execution time.

**13. What is N plus 1?** One collection query followed by an extra query for each item's relationship. Inspect query counts and use an appropriate eager-loading strategy.

**14. Can validation guarantee username uniqueness?** No. Concurrent requests require a database uniqueness constraint plus error handling.

**15. Two customers buy the last item. What prevents overselling?** Use an atomic conditional stock update or an appropriate locking strategy within a transaction, check the affected-row result, and couple it with order creation. A read-then-write sequence without concurrency control is insufficient.

### Security and reliability

**16. Does OAuth2PasswordBearer verify JWTs?** No. It extracts bearer credentials and describes the scheme; application security code verifies tokens and enforces access policy.

**17. Why check ownership after validating a token?** Token validity establishes an identity; resource ownership determines whether that identity may access a particular record.

**18. Is CORS enough to protect an API?** No. It governs browser access behavior, not identity or permission enforcement.

**19. When is BackgroundTasks insufficient?** When work must survive process failure, be retried reliably, scale independently, or expose durable job status.

**20. Why can a retry create two orders?** The first request may commit while its response is lost. Use a persisted idempotency key and defined request/result matching rules.

### Senior-level scenarios

**21. Database connections are exhausted after scaling workers. Why?** Each worker/replica has a pool, so aggregate connection demand grows. Also inspect long transactions, leaks, and slow queries before adjusting pool sizes.

**22. A response includes a lazy relationship and fails under async SQLAlchemy. Why?** Serialization may trigger unplanned database I/O or encounter detached state. Load required data within the active session and return a deliberate output representation.

**23. A background email fails after a successful order response. Should the order become a 500?** The response has already been delivered. Track delivery separately, retry according to policy, and make order success semantics explicit.

**24. How would you investigate rising p99 latency?** Separate queue/pool wait, application CPU, SQL duration, upstream latency, and serialization. Correlate traces and resource saturation with load, then fix the measured cause.

**25. What does a strong framework answer include?** Explain the mechanism, demonstrate it in code or a request flow, state the tradeoff, and describe how you would verify behavior. Naming decorators alone is not enough.

## 22. Exercises and revision plan

### Practical exercises

1. Add constrained pagination to product listing. Verify invalid page sizes and a stable sort order.
2. Build a PATCH endpoint that distinguishes omitted descriptions from explicit nulls.
3. Add ownership checks to product updates. Prove that another store cannot update the product.
4. Create two requests that race to register one username. Confirm a controlled error instead of an unhandled server failure.
5. Compare an async endpoint using a blocking sleep with one using an async sleep under overlapping requests.
6. Count SQL queries when listing stores with products, then remove N plus 1 behavior.
7. Override authentication and the database dependency in tests; restore them reliably afterward.
8. Design an order job with durable status, retries, and an idempotency key. Explain its failure windows.

### Seven study sessions

- **Session 1:** Architecture, request flow, HTTP semantics, and the runnable example.
- **Session 2:** Pydantic, required/null fields, response contracts, and PATCH behavior.
- **Session 3:** Event loop behavior, blocking calls, concurrency, and dependencies.
- **Session 4:** Sessions, transactions, async ORM, pools, and query performance.
- **Session 5:** Authentication, tenant authorization, errors, CORS, and lifespan.
- **Session 6:** Testing, background jobs, deployment, and the store-app observations.
- **Session 7:** Answer the interview questions aloud and implement two exercises without copying.

### Last-minute recall

- FastAPI is the application framework; Uvicorn is an ASGI server.
- Type hints become runtime validation only when a library uses them.
- Async requires nonblocking behavior throughout the relevant execution path.
- Dependencies provide reusable request setup; yield adds scoped cleanup.
- Input validation, authorization, and database constraints solve different problems.
- Commit before reporting a critical write as successful.
- Authenticate the caller and authorize the specific resource.
- Default background tasks are not a durable job system.
- Workers multiply memory and connection pools.
- Explain measured behavior and tradeoffs rather than promising that async is always faster.
