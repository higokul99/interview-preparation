# MetoStore Prototype Tech Stack

## Goal

Build a very lightweight prototype for MetoStore where a small business owner can:

1. Create a store
2. Add products
3. Get a shareable storefront
4. Receive customer orders

The prototype should prioritize speed and simplicity over production-scale infrastructure.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| Backend | Python + FastAPI |
| API | Basic REST APIs |
| Database | SQLite |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Authentication | Simple JWT |
| Images | Local filesystem |
| Payments | Mock payment |
| Deployment | Local initially |

---

## Architecture

```text
                  MetoStore
                      │
             ┌────────┴────────┐
             │                 │
        Next.js Frontend    Admin UI
             │
             │ REST
             ▼
        Python FastAPI
             │
             ▼
          SQLAlchemy
             │
             ▼
           SQLite
```