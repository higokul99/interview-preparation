# Generative AI & Agentic AI Interview Topics & Concept Checklist

> **Profile Context:** Senior Analyst / Agentic AI Developer (Accenture & TCS)  
> **Resume Links:** Accenture Project Oracle (Multi-agent Agentic AI workflows with AWS Bedrock, AWS AgentCore, Magentic-One, Handoff & GroupChat patterns; analyzing Functional Design to generate Technical Design & SQL); TCS Voice AI Chatbot (FastAPI, OpenAI API, LangChain, LangGraph, LDAP, ServiceNow); Certifications in LangChain & LangGraph, TCS AI Ignitor.

---

## 1. LLM Foundations & Prompt Engineering
- [ ] **Transformer Architecture & Generation Mechanics:**
  - Tokenization (Byte-Pair Encoding), context window constraints, self-attention mechanism.
  - Generation parameters: Temperature (randomness), Top-P (nucleus sampling), Frequency & Presence penalties, Max tokens.
- [ ] **Advanced Prompt Engineering:**
  - Few-shot prompting, Chain-of-Thought (CoT), Least-to-Most, Directional Stimulus.
  - ReAct pattern (Reasoning + Acting cycle).
  - System prompt hardening & defensive prompting against prompt injection and jailbreaks.
- [ ] **Structured Outputs:**
  - JSON schema enforcement, OpenAI Function Calling / Tool Calling API specs, Pydantic model response generation.

---

## 2. LangChain Framework (LCEL & Core Components)
- [ ] **LangChain Expression Language (LCEL):**
  - Declarative chaining with pipe operator (`|`).
  - Runnables: `RunnablePassthrough`, `RunnableParallel`, `RunnableLambda`, `RunnableBranch`.
  - Batching (`batch`), Streaming (`stream`), and Async (`ainvoke`, `astream`) methods.
- [ ] **Prompts & Models:** `ChatPromptTemplate`, `MessagesPlaceholder`, `ChatOpenAI`, `ChatBedrock`.
- [ ] **Output Parsers:** `PydanticOutputParser`, `JsonOutputParser`, `StrOutputParser`.
- [ ] **Memory & Conversation State:** `ConversationBufferMemory`, `ConversationSummaryMemory`, limitations in production vs external state persistence.

---

## 3. LangGraph & Stateful Graph Orchestration (Core Resume Specialty)
- [ ] **LangGraph Architecture:**
  - `StateGraph` definition and graph compilation (`graph.compile()`).
  - Graph State: Defining state schemas with `TypedDict` or `Pydantic`, reducer functions (`Annotated[list, add_messages]`).
  - Nodes (functions that transform state) and Edges (direct vs conditional edges with routing functions).
- [ ] **Persistence & Checkpointing:**
  - `MemorySaver` (in-memory) vs `PostgresSaver` / database checkpointers.
  - Human-in-the-Loop (HITL): Interrupting execution before critical tool calls (e.g. database updates, ticket creation), inspecting state, resuming execution.
  - Time Travel: Replaying and branching graphs from historical checkpoints.
- [ ] **Multi-Agent Topologies in LangGraph:**
  - **Supervisor / Orchestrator Pattern:** Central coordinator delegating to worker agents.
  - **Handoff Pattern:** Direct peer-to-peer delegation where agents pass control to another specialized agent.
  - **GroupChat / Discussion Pattern:** Multiple agents collaborating iteratively on a shared workspace.

---

## 4. Multi-Agent Systems & Agentic Patterns (Direct Resume Experience)
- [ ] **Accenture Project Oracle Architecture:**
  - Document parsing: Extracting requirements from Functional Design (FD) documents.
  - Multi-agent collaboration: Architect agent, Technical Design (TD) documentation generator agent, SQL generation & validation agent.
  - AWS Bedrock & AWS AgentCore integration.
- [ ] **Microsoft Magentic-One & AutoGen Patterns:**
  - Orchestrator agent loop, planning and progress tracking.
  - Specialized agents: Coder, WebSurfer, FileSurfer, UserProxy.
  - Inner loops vs outer loops, termination conditions to avoid infinite loops.
- [ ] **Tool Calling & Execution Safety:**
  - Tool definition, parameter validation, schema serialization.
  - Sandboxed tool execution, read-only vs mutating tool separation, transaction rollbacks on failure.
- [ ] **Model Context Protocol (MCP):**
  - MCP Architecture: Host, Client, and Server.
  - Core primitives: Resources (data/files), Prompts (templates), Tools (executable functions).
  - Why MCP is replacing bespoke tool-calling integrations across enterprise AI agents.

---

## 5. Retrieval-Augmented Generation (RAG) & Vector Databases
- [ ] **End-to-End RAG Architecture:**
  - Document ingestion: Extracting text from PDF, DOCX, Markdown, HTML.
  - Chunking strategies: Fixed size with overlap, Recursive Character Splitting, Document-aware (header/markdown) splitting, Semantic chunking.
- [ ] **Embeddings & Vector Search:**
  - Dense embeddings (OpenAI `text-embedding-3`, HuggingFace `all-MiniLM-L6-v2`) vs Sparse representations (BM25).
  - Distance metrics: Cosine Similarity, Dot Product, Euclidean Distance (L2).
- [ ] **Vector Databases:**
  - PostgreSQL with `pgvector` (`HNSW` vs `IVFFlat` indexes).
  - SingleStore Vector Search (leveraging existing SQL skills from resume).
  - In-memory / embedded vector stores: ChromaDB, FAISS.
- [ ] **Advanced RAG Patterns:**
  - **Hybrid Search:** Combining keyword search (BM25) with semantic vector search via Reciprocal Rank Fusion (RRF).
  - **Re-ranking:** Using Cross-Encoders (e.g., Cohere Rerank) to score top retrieved chunks before feeding into LLM context.
  - **Query Expansion & Transformation:** HyDE (Hypothetical Document Embeddings), Multi-Query Retriever, Sub-question decomposition.
  - Contextual compression and hallucination mitigation.

---

## 6. LLMOps, Observability & Production Deployment
- [ ] **Tracing & Observability:**
  - LangSmith: Tracing runs, latency breakdown, token usage, debugging failing agent steps.
  - OpenTelemetry / Arize Phoenix / OpenLLMetry for open-source tracing.
- [ ] **Evaluation (Evals) & Guardrails:**
  - RAG Triad evaluation: Context Relevance, Groundedness (Faithfulness), Answer Relevance (Ragas, TruLens).
  - Guardrails: NeMo Guardrails, Llama-Guard, regex/PII filters to sanitize inputs and outputs.
- [ ] **Cost & Performance Optimization:**
  - Semantic Caching (Redis / GPTCache) to avoid redundant LLM calls.
  - Streaming responses (Server-Sent Events / WebSockets).
  - Prompt token minimization and dynamic context pruning.

