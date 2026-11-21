# SQL & Relational Databases Interview Topics & Concept Checklist

> **Profile Context:** ~6 Years Python Backend Experience  
> **Resume Links:** PostgreSQL (pgAdmin, DBeaver), SingleStore (MEMSQL), MySQL, Sybase. High-volume data validation and ETL (Sybase to PostgreSQL), Cisco CDR metadata ingestion, Earnings Call Dashboard (Kafka streaming into SingleStore), SQL query generation agent (Accenture Project Oracle).

---

## 1. Advanced SQL & Window Functions (Crucial for Interviews)
- [ ] **Window Functions vs Aggregate Functions:**
  - `PARTITION BY` vs `GROUP BY` (preserving row identity vs collapsing rows).
  - Ranking functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`.
  - Value functions: `LEAD()`, `LAG()`, `FIRST_VALUE()`, `LAST_VALUE()`.
  - Window framing: `ROWS BETWEEN 1 PRECEDING AND CURRENT ROW`, `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` for moving averages and running totals.
- [ ] **Common Table Expressions (CTEs):**
  - Standard CTEs (`WITH cte AS (...)`) for readable, modular queries.
  - Recursive CTEs (`WITH RECURSIVE cte AS (...)`) for hierarchical trees, employee-manager hierarchies, and graph traversal.
- [ ] **Complex Joins & Set Operations:**
  - `INNER JOIN`, `LEFT/RIGHT OUTER JOIN`, `FULL OUTER JOIN`, `CROSS JOIN`, `SELF JOIN`.
  - `UNION` vs `UNION ALL` (performance implications of deduplication).
  - `INTERSECT`, `EXCEPT` / `MINUS`.

---

## 2. Indexing Internals & Query Performance Tuning
- [ ] **Index Data Structures:**
  - **B-Tree:** Default index for equality and range queries (`=`, `<`, `>`, `BETWEEN`).
  - **Hash:** O(1) equality lookups only.
  - **GIN (Generalized Inverted Index):** Indexing composite values, arrays, full-text search, and PostgreSQL `JSONB`.
  - **GiST / SP-GiST:** Geometric, range, and nearest-neighbor search.
  - **BRIN (Block Range Index):** Extremely lightweight index for massive append-only sequential datasets (ideal for call detail records / logs).
- [ ] **Composite Indexes & Column Ordering:**
  - The Leftmost Prefix Rule (why an index on `(A, B, C)` works for `WHERE A` and `WHERE A, B`, but not `WHERE B, C`).
  - Index selectivity and cardinality.
  - Covering Indexes (`INCLUDE` clause): Serving queries purely from the index without table heap lookups (Index-Only Scan).
  - Partial Indexes (`WHERE status = 'ACTIVE'`) and Expression/Functional Indexes (`LOWER(email)`).
- [ ] **Reading Execution Plans (`EXPLAIN` & `EXPLAIN ANALYZE`):**
  - Scans: Sequential Scan, Index Scan, Index Only Scan, Bitmap Index Scan + Bitmap Heap Scan.
  - Joins: Nested Loop Join (small datasets/indexed lookups), Hash Join (unsorted medium/large datasets), Merge Join (pre-sorted large datasets).
  - Identifying bottlenecks: Cost estimates vs actual rows/loops, disk spills (WorkMem limits).
- [ ] **PostgreSQL Table Maintenance & Bloat:**
  - MVCC (Multi-Version Concurrency Control) mechanics: Tuples, `xmin`, `xmax`, dead tuples.
  - `VACUUM` vs `VACUUM FULL`, `ANALYZE`, tuning `autovacuum` for high-throughput write workloads.

---

## 3. Transactions, ACID & Concurrency Control
- [ ] **ACID Properties:**
  - **Atomicity:** All-or-nothing completion via write-ahead logging (WAL).
  - **Consistency:** Enforcing schema constraints, foreign keys, triggers.
  - **Isolation:** Preventing concurrent transaction interference.
  - **Durability:** Guaranteeing committed changes persist across power loss.
- [ ] **Transaction Isolation Levels & Anomalies:**
  - Read Uncommitted: Suffers Dirty Read.
  - Read Committed (PostgreSQL default): Prevents Dirty Read; suffers Non-repeatable Read, Phantom Read.
  - Repeatable Read: Prevents Non-repeatable Read; uses snapshot isolation.
  - Serializable: Prevents all anomalies including write skew.
- [ ] **Locking Mechanisms:**
  - Table locks vs Row locks.
  - Shared Locks (`FOR SHARE`) vs Exclusive Locks (`FOR UPDATE`).
  - Row-level queue processing: `SELECT ... FOR UPDATE SKIP LOCKED` (building high-concurrency worker queues without contention).
  - Optimistic locking (version integer/timestamp) vs Pessimistic locking.
  - Deadlocks: Causes, detection graphs, prevention (ordering resource locks consistently).

---

## 4. Schema Design, Normalization & Partitioning
- [ ] **Relational Modeling & Normalization:**
  - 1NF (atomic values, no repeating groups), 2NF (no partial dependencies on composite keys), 3NF (no transitive dependencies), BCNF.
  - When to denormalize: Read-heavy reporting dashboards, materialized views, caching aggregations.
- [ ] **PostgreSQL Table Partitioning (Directly relevant to Cisco CDR project):**
  - Declarative partitioning: Range partitioning (by date/timestamp), List partitioning, Hash partitioning.
  - Partition pruning by query planner.
  - Detaching and archiving old partitions with minimal lock impact.
- [ ] **Semi-Structured Data (`JSON` vs `JSONB` in PostgreSQL):**
  - Storage difference (raw string vs binary parsed representation).
  - JSONB query operators (`->`, `->>`, `@>`, `?`).
  - GIN indexing on JSONB keys and values for rapid searching.

---

## 5. Distributed & Specialized Databases (From Resume)
- [ ] **SingleStore (MEMSQL) Architecture:**
  - Two-tier distributed architecture: Aggregator nodes (client query routing & compilation) vs Leaf nodes (data partitions & storage).
  - In-Memory Rowstore (OLTP low-latency writes) vs On-Disk Columnstore (OLAP analytical queries & vector operations).
  - Shard keys (determining data distribution across partitions) vs Sort keys (columnstore compression and fast range scans).
  - Streaming ingestion directly from Apache Kafka (matching your Morgan Stanley Earnings Call Dashboard project).
- [ ] **Sybase to PostgreSQL Migration & ETL:**
  - Data type conversions and precision mapping.
  - T-SQL to PL/pgSQL translation (syntax, procedural flow, exception handling).
  - Validating high-volume data consistency and discrepancies using Pandas and SQL reconciliation queries.

---

## 6. Audit Logging & Triggers (From Resume Compliance Project)
- [ ] **Database Triggers:** `BEFORE INSERT/UPDATE/DELETE`, `AFTER INSERT/UPDATE/DELETE`.
- [ ] **Audit Trail Design:** Trigger-based changelog recording `OLD` and `NEW` row states or JSON diffs to a dedicated audit table for regulatory compliance.
- [ ] **SQL Injection Prevention:** Parameterized queries, prepared statements, avoiding string concatenation in dynamic SQL.

