# Django & DRF Interview Topics & Concept Checklist

> **Profile Context:** ~6 Years Python Backend Experience  
> **Resume Links:** Technical Support Platform (Log parsing, anomaly detection, incident tracking, historical log management with Django REST APIs & PostgreSQL).

---

## 1. Django Architecture & Request-Response Lifecycle
- [ ] **Request-Response Flow:** WSGI/ASGI handler -> Middleware pre-processing -> URL resolver -> View -> Middleware post-processing -> Response.
- [ ] **Middleware Architecture:**
  - Creating custom middleware (`__call__`, `process_view`, `process_exception`, `process_template_response`).
  - Order of middleware execution (top-to-bottom for request, bottom-to-top for response).
  - Use cases: Request ID tracking, tenant routing, authentication inspection.
- [ ] **Settings & Configuration:** Split settings (base, dev, prod), environment management via `django-environ`.

---

## 2. Django ORM Deep Dive & Query Optimization
- [ ] **QuerySet Mechanics:** Lazy evaluation, QuerySet caching, slicing, chaining.
- [ ] **Solving N+1 Queries (Crucial for Senior Backend):**
  - `select_related()`: SQL `INNER JOIN` or `LEFT OUTER JOIN` for single-valued relationships (`ForeignKey`, `OneToOneField`).
  - `prefetch_related()`: Separate queries with `WHERE id IN (...)` for multi-valued relationships (`ManyToManyField`, reverse `ForeignKey`).
- [ ] **Field Filtering & Retrieval Optimization:**
  - `only()` and `defer()` for loading subsets of columns.
  - `values()` and `values_list(flat=True)` to bypass full model instantiation.
- [ ] **Aggregations & Complex Lookups:**
  - `annotate()` vs `aggregate()`.
  - `Q` objects for complex Boolean queries (`OR`, `AND`, `NOT`).
  - `F` expressions for database-level updates without race conditions (`F('counter') + 1`).
- [ ] **Transactions & Concurrency:**
  - `transaction.atomic()` context manager.
  - Row locking: `select_for_update()` (pessimistic locking) vs optimistic locking (version fields).
- [ ] **Database Migrations:**
  - Migration dependency graph, `makemigrations`, `migrate`, `--fake`.
  - Zero-downtime migrations (adding nullable column first, backfilling, setting not-null).
  - Migration squashing and conflict resolution.
- [ ] **Signals:** `post_save`, `pre_save`, `m2m_changed`, `post_delete`. Best practice: Keep business logic in services/models; use signals primarily for decoupled cross-app side effects.

---

## 3. Django REST Framework (DRF)
- [ ] **Serializers vs ModelSerializers:**
  - Field-level validation (`validate_<field_name>`) vs object-level validation (`validate`).
  - `to_representation()` and `to_internal_value()` customization.
  - Handling nested relationships (read vs write representations).
- [ ] **Views & Architecture:**
  - `APIView` vs `GenericAPIView` + Mixins vs `ModelViewSet`.
  - Routing with `DefaultRouter` / `SimpleRouter`.
  - Layered pattern: Views -> Service Layer -> Models.
- [ ] **Authentication & Permissions:**
  - `SessionAuthentication`, `TokenAuthentication`, `JWTAuthentication` (`djangorestframework-simplejwt`).
  - Custom permissions extending `BasePermission` (`has_permission`, `has_object_permission`).
- [ ] **Pagination, Filtering & Throttling:**
  - `PageNumberPagination`, `LimitOffsetPagination`, `CursorPagination` (optimal for massive datasets).
  - `django-filter` integration (`FilterSet`).
  - User and IP based rate limiting / throttling.

---

## 4. Caching & Performance
- [ ] **Cache Framework:** Redis / Memcached backends.
- [ ] **Cache Strategies:** Low-level cache API (`cache.get`, `cache.set`), per-view caching (`@cache_page`), template caching.
- [ ] **Database Connection Pooling:** Persistent database connections (`CONN_MAX_AGE`), external poolers (PgBouncer).

---

## 5. Background Tasks & Production Deployment
- [ ] **Celery & Celery Beat:**
  - Asynchronous task execution, task retries with exponential backoff.
  - Message brokers (Redis, RabbitMQ), result backends.
  - Celery Beat for scheduled jobs (periodic log ingestion/parsing).
- [ ] **WSGI Production Stack:** Gunicorn with Gevent or sync workers behind Nginx reverse proxy.
- [ ] **Static & Media File Handling:** `collectstatic`, WhiteNoise for static files, Azure Blob Storage via `django-storages`.

