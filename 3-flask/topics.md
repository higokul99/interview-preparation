# Flask Interview Topics & Concept Checklist

> **Profile Context:** ~6 Years Python Backend Experience  
> **Resume Links:** Voice Recording & Control System (Morgan Stanley: Layered Repository-Service-Controller architecture for Compliance Policy Management, enterprise SSO, LDAP, RBAC, field-level before-after audit logging), Technical Support Platform, Cisco CDR Portal (migrated to FastAPI).

---

## 1. Flask Core Internals & Architecture
- [ ] **WSGI Specification & Werkzeug:** WSGI callable signature `application(environ, start_response)`, routing map, request/response objects.
- [ ] **Contexts Mechanics (Core Senior Interview Question):**
  - **Application Context:** `current_app`, `g` (lifetime of request or CLI command).
  - **Request Context:** `request`, `session` (tied to incoming HTTP request).
  - **LocalProxy & Thread Locals:** How Werkzeug's `LocalProxy` ensures thread safety across concurrent requests in multi-threaded servers.
  - Manual context push: `app.app_context()` and `app.test_request_context()`.
- [ ] **Application Factory Pattern:** `create_app(config_name)` pattern for dynamic configuration, testing isolation, and modularity.

---

## 2. Modular Architecture & Blueprints
- [ ] **Flask Blueprints:** Registration, URL prefixes, blueprint-level templates/static folders.
- [ ] **Blueprint Request Hooks:** `before_request`, `after_request`, `teardown_request` at blueprint level vs application level.
- [ ] **Layered Repository-Service-Controller Architecture (Direct Resume Topic):**
  - **Controller / View:** Blueprint route handlers parsing input, calling services, returning JSON responses.
  - **Service Layer:** Business validation, transaction orchestration, domain logic.
  - **Repository Layer:** Data access operations, raw SQL or SQLAlchemy queries decoupled from business rules.

---

## 3. Database & SQLAlchemy Integration in Flask
- [ ] **Flask-SQLAlchemy vs Pure SQLAlchemy:**
  - `scoped_session` implementation and lifecycle tied to Flask request context.
  - Session lifecycle: `@app.teardown_appcontext` to remove/close the session.
- [ ] **Database Migrations:** Flask-Migrate (Alembic wrapper), handling migration scripts, upgrade and downgrade paths.

---

## 4. Enterprise Security, Governance & Audit Logging (Direct Resume Highlights)
- [ ] **Authentication & Single Sign-On (SSO):**
  - Enterprise SSO integration (SAML 2.0 / OAuth2 / OIDC).
  - LDAP integration (user authentication, group membership synchronization).
- [ ] **Entitlement & Role-Based Access Control (RBAC):**
  - Custom authorization decorators (`@require_role`, `@require_permission`).
  - Hierarchical and entitlement-based permission checks.
- [ ] **Field-Level Audit Logging (Key Architectural Achievement on Resume):**
  - Intercepting SQLAlchemy session events (`before_flush`, `after_flush`, or service-layer decorators).
  - Capturing before-and-after change diffs (`get_history(instance, attribute)`) on modified records.
  - Storing structured audit records (timestamp, user_id, action, table_name, record_id, changed_fields_json) for compliance audits.
- [ ] **Web Security:** CSRF protection (`Flask-WTF`), CORS (`Flask-CORS`), secure session cookies (HttpOnly, Secure, SameSite).

---

## 5. Migration from Flask to FastAPI (Architectural Comparison)
*Be prepared to articulate the architectural decisions behind your Cisco CDR project migration:*
- [ ] **Synchronous vs Asynchronous:** Flask WSGI blocking nature vs FastAPI ASGI asynchronous concurrency for high-throughput FTP/metadata ingestion.
- [ ] **Data Validation:** Flask manual validation (Marshmallow/WTForms) vs FastAPI native Pydantic models.
- [ ] **Documentation:** Flask manual Swagger / Flasgger vs FastAPI automatic interactive Swagger UI / OpenAPI schema generation.
- [ ] **Dependency Injection:** Flask `g` object / manual service instantiation vs FastAPI declarative `Depends()` system.

---

## 6. Testing, Production Deployment & Monitoring
- [ ] **Testing:** `pytest`, `app.test_client()`, test fixtures with clean database states, mocking LDAP and external APIs.
- [ ] **Production Deployment:** Gunicorn / uWSGI behind Nginx, configuring worker classes (sync, gevent, gthread), memory management.
- [ ] **Error Handling:** Custom error handlers (`@app.errorhandler`), standardized JSON error envelopes.

