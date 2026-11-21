# Interview Questions Tracker & Concept Log

> A centralized logbook to record actual questions asked during technical interviews, organized by concept. Use the template below to log new interview questions after each round.

---

## Quick Navigation
1. [Logging Template](#logging-template)
2. [FastAPI Questions](#1-fastapi-questions)
3. [Django & DRF Questions](#2-django--drf-questions)
4. [Flask Questions](#3-flask-questions)
5. [Microsoft Azure & Cloud Questions](#4-microsoft-azure--cloud-questions)
6. [Generative AI & Agentic AI Questions](#5-generative-ai--agentic-ai-questions)
7. [SQL & Database Questions](#6-sql--database-questions)
8. [Python Core & System Design Questions](#7-python-core--system-design-questions)

---

## Logging Template

Copy and paste this template whenever you receive a new interview question:

```markdown
### [YYYY-MM-DD] Company Name | Round Name (e.g., Tech Round 1)
- **Concept / Sub-topic:** (e.g., FastAPI Async, SQL Indexing, LangGraph State)
- **Question Asked:**
  > Insert the exact question asked by the interviewer here.
- **My Answer / Key Points Discussed:**
  - Point 1
  - Point 2
- **Interviewer's Follow-up Questions:**
  - Follow-up 1
- **Areas for Improvement / Correct Answer Notes:**
  - Key takeaway or revision point.
```

---

## 1. FastAPI Questions

### Sample Entry | FastAPI Concurrency & Async
- **Concept / Sub-topic:** Event Loop & Blocking Calls in FastAPI
- **Question Asked:**
  > What happens if you make a blocking synchronous call (like `time.sleep(5)` or `requests.get()`) inside an `async def` endpoint in FastAPI? How does it differ from a regular `def` endpoint?
- **My Answer / Key Points Discussed:**
  - In an `async def` endpoint, the function runs directly on the main ASGI event loop. A synchronous blocking call blocks the entire event loop thread, preventing any other concurrent request from being processed until it completes.
  - In a regular `def` endpoint, FastAPI automatically offloads execution to an external threadpool (`anyio.to_thread.run_sync`), so the event loop remains unblocked.
  - In `async def`, non-blocking async libraries must be used (e.g., `asyncio.sleep`, `httpx.AsyncClient`) or run explicitly in a threadpool (`run_in_threadpool`).
- **Interviewer's Follow-up Questions:**
  - How would you handle a heavy CPU-bound task in FastAPI? (Use `ProcessPoolExecutor` or Celery to bypass Python's GIL).
- **Areas for Improvement / Correct Answer Notes:**
  - Always remember that async does not mean multi-threaded; it is cooperative multitasking on a single thread.

<!-- Add new FastAPI questions below -->

---

## 2. Django & DRF Questions

### Sample Entry | Django ORM Optimization
- **Concept / Sub-topic:** N+1 Query Problem & `select_related` vs `prefetch_related`
- **Question Asked:**
  > Explain the exact difference between `select_related` and `prefetch_related` in Django ORM. When would you use which?
- **My Answer / Key Points Discussed:**
  - `select_related()` performs an SQL `JOIN` (INNER or LEFT OUTER JOIN) in a single database query. It works only for single-valued relationships: `ForeignKey` and `OneToOneField`.
  - `prefetch_related()` executes separate database queries: one for the primary records and another for the related records using `WHERE id IN (...)`, joining the objects in Python memory. It is used for multi-valued relationships: `ManyToManyField` and reverse `ForeignKey`.
  - Using `select_related` on a ManyToMany relationship will throw an error.
- **Interviewer's Follow-up Questions:**
  - Can you combine `select_related` and `prefetch_related` in the same query? (Yes, for traversing nested relations).
- **Areas for Improvement / Correct Answer Notes:**
  - Mention `Prefetch()` objects when you need to filter or optimize the prefetched queryset.

<!-- Add new Django questions below -->

---

## 3. Flask Questions

### Sample Entry | Flask Internals & Architecture
- **Concept / Sub-topic:** Application Context vs Request Context & Thread Safety
- **Question Asked:**
  > How does Flask maintain thread safety when handling multiple requests concurrently? What is the difference between Application Context and Request Context?
- **My Answer / Key Points Discussed:**
  - Flask utilizes Werkzeug's `LocalProxy` and context stacks to isolate data per thread/greenlet.
  - **Request Context:** Bound to the incoming HTTP request; exposes `request` and `session`. Pushed when a request arrives and popped after response generation.
  - **Application Context:** Bound to the application instance; exposes `current_app` and `g`. Allows access to app-level configuration without hardcoding imports and stores request-scoped global scratchpad data in `g`.
  - Outside of a request (such as in CLI commands or background workers), you must manually push an app context using `with app.app_context():`.
- **Interviewer's Follow-up Questions:**
  - Why did you migrate your Fraud Number Management Portal from Flask to FastAPI?
- **Areas for Improvement / Correct Answer Notes:**
  - Emphasize async I/O throughput benefits, native Pydantic validation, and automatic OpenAPI documentation.

<!-- Add new Flask questions below -->

---

## 4. Microsoft Azure & Cloud Questions

### Sample Entry | Azure Security & App Services
- **Concept / Sub-topic:** Managed Identities & Zero-Secret Architecture
- **Question Asked:**
  > How do you connect an Azure App Service hosting a Python backend to Azure Blob Storage without storing any connection strings or secrets in your codebase or configuration?
- **My Answer / Key Points Discussed:**
  - Enable **Managed Identity** (System-Assigned or User-Assigned) on the Azure App Service.
  - In Azure Blob Storage, grant the App Service's Managed Identity the appropriate RBAC role (e.g., `Storage Blob Data Contributor`).
  - In the Python application, use `DefaultAzureCredential()` from the `azure-identity` SDK package. The SDK automatically detects the App Service Managed Identity endpoint, fetches an Entra ID token, and authenticates the `BlobServiceClient`.
  - This eliminates hardcoded storage keys, connection strings, and the need for credential rotation.
- **Interviewer's Follow-up Questions:**
  - How do deployment slots work in App Service, and what happens to environment variables during a swap?
- **Areas for Improvement / Correct Answer Notes:**
  - Clarify "slot settings" (sticky settings) that remain with a slot vs non-sticky settings that move with code.

<!-- Add new Azure questions below -->

---

## 5. Generative AI & Agentic AI Questions

### Sample Entry | LangGraph & Multi-Agent Architecture
- **Concept / Sub-topic:** LangGraph State Management & Handoff Pattern
- **Question Asked:**
  > How does state management work in LangGraph? How did you implement multi-agent collaboration (such as Handoff or GroupChat) in your Accenture Oracle project?
- **My Answer / Key Points Discussed:**
  - In LangGraph, state is defined using a central schema (e.g., `TypedDict` or Pydantic model). Nodes are Python functions that receive the current state and return an update dictionary. Reducers (like `Annotated[list, add_messages]`) define how updates are merged into state.
  - In the **Handoff pattern**, specialized agents (e.g., Functional Design Parser Agent, Technical Design Doc Agent, SQL Generation Agent) pass control via tool calls that transfer active control to the next agent node using conditional edges.
  - In **GroupChat**, an orchestrator or supervisor agent evaluates user input, decides which worker agent should speak next, and aggregates their outputs into a unified workspace.
  - Checkpointing via `PostgresSaver` enables persistence, state resumption, and human-in-the-loop approvals before executing mutating SQL queries.
- **Interviewer's Follow-up Questions:**
  - How do you prevent infinite loops between agents? (Max iteration limits, state-based termination checks, clear completion conditions).
- **Areas for Improvement / Correct Answer Notes:**
  - Highlight guardrails (Llama-Guard/NeMo) and automated evaluation (Ragas groundedness scoring).

<!-- Add new GenAI questions below -->

---

## 6. SQL & Database Questions

### Sample Entry | SQL Window Functions & Optimization
- **Concept / Sub-topic:** Window Functions vs Aggregations & Query Plans
- **Question Asked:**
  > Write a query to find the top 2 highest-paid employees in each department. What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`?
- **My Answer / Key Points Discussed:**
  - Use `DENSE_RANK()` (or `ROW_NUMBER()`) over `PARTITION BY department_id ORDER BY salary DESC` inside a CTE:
    ```sql
    WITH RankedEmployees AS (
      SELECT employee_id, department_id, salary,
             DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank
      FROM employees
    )
    SELECT * FROM RankedEmployees WHERE rank <= 2;
    ```
  - **`ROW_NUMBER()`:** Assigns unique sequential integers (e.g. 1, 2, 3, 4) regardless of ties.
  - **`RANK()`:** Gives identical values the same rank, but skips ranks for subsequent values (e.g. 1, 2, 2, 4).
  - **`DENSE_RANK()`:** Gives identical values the same rank without skipping (e.g. 1, 2, 2, 3).
- **Interviewer's Follow-up Questions:**
  - What index would you create to make this query fast? (Composite index on `(department_id, salary DESC)`).
- **Areas for Improvement / Correct Answer Notes:**
  - Explain Index-Only Scans when selecting only indexed columns.

<!-- Add new SQL questions below -->

---

## 7. Python Core & System Design Questions

### Sample Entry | Python Concurrency & Memory Management
- **Concept / Sub-topic:** GIL, Multiprocessing vs Multithreading vs AsyncIO
- **Question Asked:**
  > Explain Python's Global Interpreter Lock (GIL). When would you choose Multithreading, Multiprocessing, or AsyncIO for a backend application?
- **My Answer / Key Points Discussed:**
  - The GIL is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously in CPython, safeguarding reference counting memory management.
  - **Multithreading:** Best for I/O-bound tasks using synchronous libraries (network/disk waits release GIL). Limited CPU scaling.
  - **Multiprocessing:** Best for CPU-bound tasks (data transformation, Pandas computations, machine learning). Creates separate Python processes with their own memory space and GIL.
  - **AsyncIO:** Best for high-concurrency I/O-bound network applications (FastAPI microservices). Single-threaded cooperative multitasking with minimal memory overhead.
- **Interviewer's Follow-up Questions:**
  - How does Python's garbage collector handle circular references? (Generational cyclic garbage collector using three generations).
- **Areas for Improvement / Correct Answer Notes:**
  - Mention PEP 703 (free-threaded Python in 3.13+) as a modern development in CPython.

<!-- Add new Python & System Design questions below -->

