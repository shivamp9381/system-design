import { useState } from "react";

const chapters = [
  {
    id: 1,
    title: "Foundations of System Design",
    icon: "⚙️",
    color: "#F59E0B",
    duration: "2 hrs",
    topics: ["What is System Design?", "Functional vs Non-Functional Requirements", "Back-of-envelope Estimation", "CAP Theorem", "ACID vs BASE"],
    content: `
## What is System Design?

System Design is the process of defining the **architecture, components, modules, interfaces, and data flow** of a system to satisfy specified requirements.

It bridges the gap between requirements and implementation — you're not writing code, you're **thinking at scale**.

---

### Functional vs Non-Functional Requirements

**Functional Requirements** define *what* the system does:
- Users can upload photos
- System sends email notifications
- Search returns results in < 2s

**Non-Functional Requirements** define *how well* the system does it:
- **Availability**: 99.99% uptime (≈ 52 min downtime/year)
- **Scalability**: Handle 10x traffic spikes
- **Latency**: P99 response < 200ms
- **Consistency**: All users see the same data
- **Durability**: No data loss

---

### Back-of-Envelope Estimation

Always estimate before designing. Key numbers to memorize:

| Metric | Value |
|---|---|
| 1 day in seconds | ~86,400 |
| 1 million users × 1 req/day | ~12 req/sec |
| 1 photo (compressed) | ~300 KB |
| 1 GB | 10⁹ bytes |
| HDD seek time | ~10ms |
| SSD read | ~0.1ms |
| Network RTT (same DC) | ~0.5ms |

**Example**: Design a URL shortener for 100M users/day
- Writes: 100M / 86,400 ≈ **1,160 writes/sec**
- Reads (10:1 ratio): ≈ **11,600 reads/sec**
- Storage (5 years): 100M × 365 × 5 × 100 bytes ≈ **18 TB**

---

### CAP Theorem

In any distributed system, you can only guarantee **2 of 3**:

- **C**onsistency — every read returns the latest write
- **A**vailability — every request gets a response (not guaranteed to be latest)
- **P**artition Tolerance — system continues despite network partitions

> In practice, network partitions *will* happen. So you choose between **CP** (banks, payments) or **AP** (social feeds, DNS).

---

### ACID vs BASE

| ACID | BASE |
|---|---|
| Atomicity | Basically Available |
| Consistency | Soft state |
| Isolation | Eventually consistent |
| Durability | |
| **SQL databases** | **NoSQL / distributed systems** |
    `,
    exercises: [
      "Estimate the storage needed for a Twitter-like app with 500M users posting 3 tweets/day (avg 140 chars + 30% with images at 200KB)",
      "Classify these requirements as functional or non-functional: login, 99.9% uptime, search, < 500ms latency, profile edit",
      "Draw a simple diagram of CAP theorem and place MongoDB, Cassandra, HBase, and MySQL in the correct zone",
    ],
    questions: [
      { q: "What does P99 latency mean?", a: "99% of requests complete within that time threshold. 1% may be slower." },
      { q: "If availability is 99.9%, how much downtime per year is allowed?", a: "~8.7 hours per year (0.1% of 525,600 minutes)." },
      { q: "Why can't we have CAP all three at once?", a: "If a network partition occurs, the system must either stop responding (sacrifice Availability) or return potentially stale data (sacrifice Consistency). You can't do both." },
      { q: "What is eventual consistency?", a: "All replicas will eventually converge to the same value — but reads may temporarily return stale data." },
    ]
  },
  {
    id: 2,
    title: "Scalability & Load Balancing",
    icon: "⚖️",
    color: "#3B82F6",
    duration: "2.5 hrs",
    topics: ["Vertical vs Horizontal Scaling", "Load Balancing Algorithms", "Stateless Architecture", "Session Management", "Sticky Sessions"],
    content: `
## Scalability

Scalability is the ability to handle increased load by adding resources.

---

### Vertical vs Horizontal Scaling

**Vertical Scaling (Scale Up)**
- Add more CPU/RAM/disk to a single machine
- Simple — no code changes
- Limited by hardware ceiling
- Single point of failure
- Example: RDS instance upgrade

**Horizontal Scaling (Scale Out)**
- Add more machines to the pool
- Requires stateless services
- Infinitely scalable (theoretically)
- Needs a load balancer
- Example: Adding EC2 instances behind ALB

> Most modern systems use **horizontal scaling** for web/app tiers and **vertical scaling** for databases initially.

---

### Load Balancing

A load balancer distributes incoming traffic across multiple servers.

**Layer 4 (Transport)** — routes by IP + TCP port, fast, no content inspection
**Layer 7 (Application)** — routes by URL, headers, cookies — smarter but more overhead

#### Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|---|---|---|
| Round Robin | Rotate requests evenly | Uniform workloads |
| Weighted Round Robin | More traffic to powerful nodes | Heterogeneous servers |
| Least Connections | Send to server with fewest active requests | Variable request duration |
| IP Hash | Hash client IP → same server | Session persistence |
| Random | Random selection | Simple, stateless |
| Consistent Hashing | Hash ring for routing | Distributed caches |

---

### Stateless Architecture

For horizontal scaling to work, servers must be **stateless** — no local session data.

**Stateful (bad for scaling)**:
- Server stores session data in memory
- User must hit the same server (sticky session)
- If server dies, session is lost

**Stateless (good for scaling)**:
- Session stored in Redis / database
- Any server can handle any request
- Servers are interchangeable

---

### Consistent Hashing

Used in distributed caches and databases to minimize re-routing when nodes are added/removed.

- Place nodes on a hash ring
- Map each key to a position on the ring
- Assign to the nearest clockwise node
- Adding a node only remaps ~1/N keys (vs N-1/N with naive hashing)

> Used by: Amazon DynamoDB, Apache Cassandra, Memcached, Akamai CDN
    `,
    exercises: [
      "Design a load balancer setup for an e-commerce site that expects 10x traffic spikes during Black Friday. What algorithm would you use and why?",
      "You have 3 servers: A (8 CPU), B (4 CPU), C (2 CPU). Assign weights for weighted round-robin to distribute load proportionally.",
      "Draw a consistent hashing ring with 4 nodes. Show what happens when you add a 5th node — which keys get remapped?",
    ],
    questions: [
      { q: "What is the difference between L4 and L7 load balancing?", a: "L4 routes by IP/port (fast, no content inspection). L7 routes by HTTP content like URL, headers, cookies (smarter, enables A/B testing, URL-based routing)." },
      { q: "What problem do sticky sessions solve, and what problem do they create?", a: "They solve session state on a single server. They create uneven load distribution and failure on server crash." },
      { q: "How does consistent hashing reduce cache misses during scaling?", a: "Only ~1/N of keys need remapping when a node is added/removed, vs 100% remapping with modulo hashing." },
      { q: "What is a health check in load balancing?", a: "The load balancer periodically pings servers. If a server fails the check, it's removed from the rotation until it recovers." },
    ]
  },
  {
    id: 3,
    title: "Databases & Storage",
    icon: "🗄️",
    color: "#10B981",
    duration: "3 hrs",
    topics: ["SQL vs NoSQL", "Indexing", "Sharding", "Replication", "Database Partitioning", "Data Warehouses"],
    content: `
## Databases & Storage

Choosing the right database is one of the most impactful system design decisions.

---

### SQL vs NoSQL

**SQL (Relational)**
- Structured schema, ACID compliant
- Joins, complex queries
- Vertical scaling primarily
- Best for: Financial systems, ERP, e-commerce inventory
- Examples: PostgreSQL, MySQL, SQLite

**NoSQL Types**

| Type | Examples | Best For |
|---|---|---|
| Document | MongoDB, CouchDB | User profiles, catalogs, CMS |
| Key-Value | Redis, DynamoDB | Caching, sessions, leaderboards |
| Wide-Column | Cassandra, HBase | Time-series, IoT, activity feeds |
| Graph | Neo4j, Amazon Neptune | Social networks, recommendation engines |

---

### Indexing

An index is a data structure that speeds up reads at the cost of write overhead and storage.

**B-Tree Index** (default) — good for range queries and equality
**Hash Index** — O(1) lookups, no range queries
**Composite Index** — index on multiple columns; column order matters
**Covering Index** — includes all columns needed, avoids table scan

> Rule: Never add indexes blindly. Each index slows down writes. Profile first.

**Index selectivity**: High cardinality columns (email, user_id) benefit most from indexing. Low cardinality (boolean, gender) often don't.

---

### Replication

Copy data across multiple nodes for **availability** and **read scaling**.

**Primary-Replica (Master-Slave)**
- All writes go to primary
- Replicas serve reads
- Failover: promote replica on primary failure
- Replication lag can cause stale reads

**Multi-Primary (Active-Active)**
- Any node accepts writes
- Conflict resolution required
- Used in geo-distributed systems

---

### Sharding (Horizontal Partitioning)

Split data across multiple database nodes.

**Range Sharding** — by ID range (1–1M on shard 1, etc.)
- Simple, supports range queries
- Hotspot risk (all new users go to latest shard)

**Hash Sharding** — hash(user_id) % num_shards
- Even distribution
- Range queries require scatter-gather

**Directory Sharding** — lookup table maps key → shard
- Most flexible
- Lookup table is a bottleneck/single point of failure

> **Resharding problem**: When you need more shards, consistent hashing minimizes data movement.

---

### Read Replicas vs Caching

| | Read Replicas | Cache (Redis) |
|---|---|---|
| Data freshness | Near-real-time | Configurable TTL |
| Query complexity | Full SQL | Key-value only |
| Cost | Higher (full DB) | Lower (RAM) |
| Use case | Reporting, analytics | Hot data, sessions |
    `,
    exercises: [
      "Design a sharding strategy for a social media app with 500M users. What shard key would you choose and why? What are the tradeoffs?",
      "A query on users table takes 8s. The table has 50M rows. What indexes would you add? Write the CREATE INDEX statements.",
      "Compare storage costs: storing 1B events in PostgreSQL vs Cassandra (wide-column) vs DynamoDB. What schema would each use?",
    ],
    questions: [
      { q: "What is replication lag and how does it affect your system?", a: "The delay between a write on the primary and its appearance on replicas. Can cause stale reads. Mitigated by reading from primary for critical data or using synchronous replication." },
      { q: "When would you choose MongoDB over PostgreSQL?", a: "When schema is dynamic/varies per document, you need fast iteration, or data is naturally hierarchical (embedded documents). PostgreSQL wins for complex joins and ACID requirements." },
      { q: "What is a hot shard and how do you fix it?", a: "A shard receiving disproportionately more traffic (e.g., celebrity user). Fix by splitting the shard, using a different shard key, or offloading hot users to dedicated shards." },
      { q: "Explain the N+1 query problem.", a: "Fetching N records then making N additional queries for related data. Solved by JOIN or eager loading (e.g., SELECT IN)." },
    ]
  },
  {
    id: 4,
    title: "Caching",
    icon: "⚡",
    color: "#8B5CF6",
    duration: "2 hrs",
    topics: ["Cache Hierarchy", "Eviction Policies", "Cache-Aside / Write-Through / Write-Back", "CDN", "Cache Stampede", "Redis Deep Dive"],
    content: `
## Caching

Caching stores frequently accessed data closer to the consumer to reduce latency and database load.

---

### Cache Hierarchy

\`\`\`
Client Browser Cache
      ↓
    CDN (Edge Cache)
      ↓
  API Gateway Cache
      ↓
  Application Cache (Redis/Memcached)
      ↓
    Database Query Cache
      ↓
    Database (Source of Truth)
\`\`\`

Each level trades off **freshness** for **speed**.

---

### Cache-Aside (Lazy Loading)

Application manages cache explicitly:
1. Check cache → hit? Return data
2. Cache miss → query DB → store in cache → return

✅ Cache only stores requested data
❌ First request is always slow (cold start)
❌ Risk of stale data if DB updates bypass cache

---

### Write-Through

Every DB write also updates the cache synchronously:
1. Write to DB
2. Write to cache
3. Return

✅ Cache always fresh
❌ Every write has extra latency
❌ Caches data that may never be read

---

### Write-Behind (Write-Back)

Write to cache first, asynchronously flush to DB:
1. Write to cache
2. Return to user (fast!)
3. Background job writes to DB

✅ Very fast writes
❌ Risk of data loss if cache dies before flush
❌ Complex consistency guarantees

---

### Eviction Policies

| Policy | When Used |
|---|---|
| LRU (Least Recently Used) | General purpose, temporal locality |
| LFU (Least Frequently Used) | Frequency-based hot data |
| FIFO | Simple queues |
| TTL (Time To Live) | Time-sensitive data |
| Random | Approximations, low overhead |

Redis default: LRU with allkeys-lru

---

### Cache Stampede (Thundering Herd)

When a cached item expires, many requests simultaneously hit the DB before the cache is repopulated.

**Solutions**:
- **Mutex/Lock**: Only one request rebuilds the cache
- **Probabilistic Early Expiration**: Randomly expire slightly before TTL
- **Background Refresh**: Async refresh before expiry
- **Jitter**: Randomize TTLs slightly to spread expirations

---

### CDN (Content Delivery Network)

Geographically distributed cache servers for **static assets** (images, JS, CSS, video).

- **Push CDN**: You upload content to CDN proactively
- **Pull CDN**: CDN fetches from origin on first request, caches for subsequent

> Cache-Control and ETag headers control CDN caching behavior.
    `,
    exercises: [
      "Design the caching layer for a news website with 10M daily users. 80% of traffic hits the top 1000 articles. What strategy, TTL, and eviction policy?",
      "You notice your Redis hit rate dropped from 95% to 60%. Walk through your debugging process step by step.",
      "Implement a cache stampede prevention strategy using pseudocode for a user profile cache with 1M users.",
    ],
    questions: [
      { q: "What is a cache hit ratio and what's considered good?", a: "Hits / (Hits + Misses). Above 80–90% is generally good. Below 50% means your cache is barely helping." },
      { q: "Why is LRU the most common eviction policy?", a: "It matches temporal locality — recently accessed data is likely to be accessed again. Simple to implement and generally effective for most workloads." },
      { q: "Can you cache authenticated user data? What are the risks?", a: "Yes, but you must key by user ID and be careful about data isolation. Risk: serving one user's data to another if keys are misconfigured." },
      { q: "What's the difference between Redis and Memcached?", a: "Redis supports rich data structures (lists, sets, sorted sets, hashes), persistence, replication, Lua scripting. Memcached is simpler, faster for pure key-value, no persistence." },
    ]
  },
  {
    id: 5,
    title: "Message Queues & Event-Driven Systems",
    icon: "📬",
    color: "#EF4444",
    duration: "3 hrs",
    topics: ["Why Queues?", "Kafka Architecture", "RabbitMQ vs Kafka", "Dead Letter Queues", "Event Sourcing", "CQRS", "Pub/Sub", "Exactly-Once Delivery"],
    content: `
## Message Queues & Event-Driven Systems

Queues **decouple producers from consumers**, enabling async processing and absorbing traffic spikes.

---

### Why Message Queues?

**Without queues**:
- User uploads photo → API calls resize service → waits 3s → returns
- Resize service outage = API outage

**With queues**:
- User uploads photo → API enqueues job → returns immediately (200ms)
- Resize service processes at its own pace
- Resize service crashes → messages persist, processed when it recovers

Benefits:
- **Decoupling**: Services don't need to know about each other
- **Buffering**: Absorb traffic spikes
- **Resilience**: Messages persist through failures
- **Async processing**: Improve user-perceived performance

---

### Core Concepts

**Producer**: Publishes messages to a queue/topic
**Consumer**: Reads and processes messages
**Broker**: The queue server (Kafka, RabbitMQ, SQS)
**Topic/Queue**: The channel for messages
**Consumer Group**: Multiple consumers sharing a topic's partitions

---

### Apache Kafka Deep Dive

Kafka is a **distributed log** — not a traditional queue.

**Architecture**:
- **Topics**: Named streams of records
- **Partitions**: Topics split into ordered, immutable logs
- **Brokers**: Kafka server nodes
- **Offsets**: Position of a message within a partition
- **Consumer Groups**: Partitions assigned to group members (1 partition = 1 consumer at a time)

**Key Properties**:
- Messages are persisted to disk (configurable retention: 7 days default)
- Consumers track their own offset — can replay messages
- Ordered only within a partition (not across)
- Throughput: millions of messages/sec

**Partitioning Strategy**:
- By user_id: all events for a user go to same partition (ordering guarantee)
- By random: maximum throughput, no ordering

---

### RabbitMQ vs Kafka vs SQS

| Feature | RabbitMQ | Kafka | AWS SQS |
|---|---|---|---|
| Model | Queue (push) | Log (pull) | Queue (pull) |
| Message replay | ❌ | ✅ | ❌ |
| Ordering | Per-queue | Per-partition | FIFO queue only |
| Throughput | Moderate | Very High | High |
| Retention | Until consumed | Time-based | 14 days max |
| Best for | Task queues, RPC | Event streaming, analytics | Simple decoupling on AWS |

---

### Dead Letter Queues (DLQ)

When a message fails processing N times, move it to a DLQ for manual inspection/replay.

\`\`\`
Main Queue → Consumer fails 3x → Dead Letter Queue
                                        ↓
                              Alert engineer → inspect → fix → replay
\`\`\`

---

### Message Delivery Guarantees

| Guarantee | Meaning | Tradeoff |
|---|---|---|
| At-most-once | Message sent once, may be lost | Fast, no duplicates, possible loss |
| At-least-once | Retried until ACK, may duplicate | Safe, requires idempotency |
| Exactly-once | Delivered and processed exactly once | Complex, expensive |

> **Idempotency**: Processing a message twice has the same effect as once. Use a deduplication key (message ID) to achieve this.

---

### Event Sourcing & CQRS

**Event Sourcing**: Store all state changes as an immutable sequence of events (not the current state).
- The "bank account" pattern: don't store balance, store all transactions
- Full audit trail, time-travel debugging
- Replay events to rebuild state

**CQRS (Command Query Responsibility Segregation)**:
- **Write model (Command side)**: handles updates, normalized DB
- **Read model (Query side)**: denormalized, optimized for queries
- Events sync the two sides asynchronously

> Common pattern: Write to PostgreSQL → emit events via Kafka → materialize read views in Elasticsearch or Redis
    `,
    exercises: [
      "Design a notification system (email, SMS, push) using message queues. How do you handle failures? What's your DLQ strategy?",
      "You have an order processing system. Model it using Event Sourcing: list all events, their payloads, and how you'd rebuild order state from them.",
      "Kafka has 6 partitions and 3 consumers in a group. Draw the partition assignment. What happens when a 4th consumer joins? A 7th?",
    ],
    questions: [
      { q: "How does Kafka achieve high throughput?", a: "Sequential disk I/O (log append), zero-copy data transfer, batching, compression, and consumer-pull model that avoids broker overhead of push delivery." },
      { q: "What is backpressure and how do queues help?", a: "When consumers can't keep up with producers, backpressure is the signal to slow down. Queues absorb the burst, letting consumers process at their own rate." },
      { q: "How do you ensure message ordering in Kafka?", a: "Use a single partition (limits throughput) or partition by a key (user_id) to guarantee ordering within a partition. Across partitions, there's no global ordering." },
      { q: "What's the difference between a queue and a topic?", a: "A queue delivers each message to one consumer. A topic (pub/sub) delivers each message to all subscribers. Kafka topics with consumer groups behave like queues within a group." },
    ]
  },
  {
    id: 6,
    title: "API Design & Communication",
    icon: "🔌",
    color: "#06B6D4",
    duration: "2 hrs",
    topics: ["REST vs GraphQL vs gRPC", "API Gateway", "Rate Limiting", "Idempotency Keys", "Webhooks", "Long Polling vs WebSockets"],
    content: `
## API Design & Communication

How services talk to each other — and how clients talk to services.

---

### REST vs GraphQL vs gRPC

**REST**
- Resources + HTTP verbs (GET, POST, PUT, DELETE)
- Stateless, cacheable
- Over-fetching / under-fetching problem
- Best for: Public APIs, CRUD operations

**GraphQL**
- Single endpoint, client specifies exact data shape
- Solves over/under-fetching
- Harder to cache (POST requests)
- Best for: Complex data graphs, mobile apps (bandwidth-sensitive)

**gRPC**
- Binary protocol (Protocol Buffers), HTTP/2
- Strongly typed contracts (.proto files)
- 5–10x faster than REST for internal comms
- Bidirectional streaming support
- Best for: Microservices internal communication

---

### API Gateway

A single entry point for all client requests:
- **Authentication / Authorization** (JWT, API keys)
- **Rate Limiting** and throttling
- **Request routing** to microservices
- **Load balancing**
- **SSL termination**
- **Request/Response transformation**
- **Logging and monitoring**

---

### Rate Limiting Algorithms

**Token Bucket**
- Bucket holds N tokens, refilled at rate R
- Each request consumes 1 token
- Allows bursts up to bucket size
- Most common (used by AWS, Stripe)

**Leaky Bucket**
- Requests enter a queue, processed at fixed rate
- Smooths out bursts completely
- Requests queue or drop if full

**Fixed Window Counter**
- Count requests per time window
- Simple but boundary exploit: burst at end+start of window

**Sliding Window Log**
- Store timestamp of each request
- Count in rolling window
- Accurate but memory-intensive

---

### Idempotency Keys

Prevent duplicate operations on retry:
1. Client generates unique idempotency key (UUID)
2. Sends with request header: \`Idempotency-Key: abc-123\`
3. Server stores response for that key
4. On retry, server returns cached response

> Critical for: payments, order creation, any state-changing operation

---

### WebSockets vs Long Polling vs SSE

| | Long Polling | Server-Sent Events | WebSockets |
|---|---|---|---|
| Direction | Client → Server (repeated) | Server → Client | Bidirectional |
| Protocol | HTTP | HTTP | WS |
| Use case | Simple notifications | Live feeds, dashboards | Chat, games, collaborative |
| Overhead | High (repeated requests) | Low | Low |

---

### Webhooks

Server-to-server notifications — your server calls the client's URL when an event happens.

\`\`\`
Stripe → POST /your-webhook → your server
\`\`\`

Challenges:
- Client server might be down → retry with exponential backoff
- Verify signature (HMAC) to prevent spoofing
- Make handler idempotent (webhook may be delivered multiple times)
    `,
    exercises: [
      "Design a rate limiter for an API that allows 100 req/min per user. Code the Token Bucket algorithm in pseudocode using Redis.",
      "Design the API for a ride-sharing app (Uber). Define all REST endpoints for: booking, tracking, payment, rating.",
      "Compare REST vs GraphQL for a social media feed. When would you switch from REST to GraphQL?",
    ],
    questions: [
      { q: "Why is gRPC faster than REST?", a: "Binary serialization (protobuf) is smaller and faster to parse than JSON. HTTP/2 supports multiplexing, header compression, and connection reuse." },
      { q: "What HTTP status code should a rate-limited request return?", a: "429 Too Many Requests, with Retry-After header indicating when they can retry." },
      { q: "How do you version a REST API?", a: "URL versioning (/v1/users), Header versioning (Accept: application/vnd.api+json;version=1), or Query param (?version=1). URL versioning is most common and explicit." },
      { q: "What is HATEOAS?", a: "Hypermedia As The Engine Of Application State — API responses include links to related actions. A GET /orders/1 response includes links to /cancel, /pay, /ship." },
    ]
  },
  {
    id: 7,
    title: "Microservices & Distributed Systems",
    icon: "🌐",
    color: "#F97316",
    duration: "3 hrs",
    topics: ["Microservices vs Monolith", "Service Discovery", "Circuit Breaker", "Saga Pattern", "Distributed Tracing", "Service Mesh"],
    content: `
## Microservices & Distributed Systems

Breaking a system into small, independently deployable services.

---

### Microservices vs Monolith

**Monolith**
- Single deployable unit
- Simple development, easy debugging
- Scales as a whole unit
- Good starting point for most products

**Microservices**
- Each service owns its data and logic
- Independent deployments, tech diversity
- Scales independently (only scale what's needed)
- Distributed systems complexity (network, failures, consistency)

> Rule of thumb: Start with a modular monolith. Extract services when you feel the pain (deploy coupling, scaling bottlenecks, team autonomy).

---

### Service Discovery

How does Service A find Service B's address in a dynamic environment?

**Client-Side Discovery**: Client queries service registry → gets list of instances → load balances itself (Eureka + Ribbon)

**Server-Side Discovery**: Client → load balancer → load balancer queries registry → routes (AWS ALB + ECS)

**Service Registry**: Consul, Zookeeper, Kubernetes etcd

---

### Circuit Breaker Pattern

Prevents cascading failures when a downstream service is slow/failing.

**States**:
1. **Closed** (normal) — requests pass through, failures counted
2. **Open** (tripped) — all requests fail fast, no calls to downstream
3. **Half-Open** (testing) — allow limited requests to test if service recovered

\`\`\`
Request → Circuit Breaker → Downstream Service
                ↓ (if failure rate > threshold)
         OPEN: return fallback immediately
\`\`\`

Implemented by: Hystrix (Netflix), Resilience4j, Polly (.NET)

---

### Distributed Transactions & the Saga Pattern

In microservices, you can't use a single DB transaction across services.

**Saga Pattern**: A sequence of local transactions, each publishing an event.

**Choreography Saga** (event-driven):
- Each service listens for events and triggers the next step
- Decoupled but hard to trace

**Orchestration Saga** (central coordinator):
- A saga orchestrator directs each step
- Easier to monitor but creates coupling

**Compensating Transactions**: On failure, trigger rollback events (like refunds) to undo previous steps.

---

### Distributed Tracing

In microservices, a single request spans multiple services. How do you debug it?

- Each request gets a **Trace ID** (propagated in headers)
- Each service creates a **Span** (start time, duration, metadata)
- Spans form a tree showing the full request lifecycle

Tools: **Jaeger**, **Zipkin**, **AWS X-Ray**, **OpenTelemetry**

---

### 12-Factor App Principles (for cloud-native services)

1. Codebase — one repo, many deploys
2. Dependencies — explicitly declared
3. Config — in environment variables
4. Backing services — attached resources (DB, cache = same)
5. Build/Release/Run — strict separation
6. Processes — stateless processes
7. Port binding — services expose via port
8. Concurrency — scale via process model
9. Disposability — fast startup, graceful shutdown
10. Dev/Prod parity — keep environments similar
11. Logs — treat as event streams
12. Admin processes — run as one-off processes
    `,
    exercises: [
      "Design the microservices architecture for an e-commerce system. Define services, their responsibilities, and how they communicate (sync vs async).",
      "A payment service times out. Walk through how a Circuit Breaker would behave. What fallback would you implement?",
      "Design a Saga for 'Place Order' that spans: inventory service, payment service, shipping service. Define compensation transactions for each failure scenario.",
    ],
    questions: [
      { q: "What is the two-generals problem?", a: "It's impossible to guarantee both generals (two systems) confirm a message over an unreliable network. Illustrates why distributed consensus is hard." },
      { q: "What is a bulkhead pattern?", a: "Isolate failures to prevent cascade. Like ship compartments — if one fills with water, others stay dry. In services: separate thread pools per downstream dependency." },
      { q: "What is eventual consistency in microservices?", a: "After a write, different services may temporarily see different data. They'll converge once events propagate. Requires designing for stale reads." },
      { q: "How do you handle distributed transactions without two-phase commit?", a: "Saga pattern with compensating transactions. Outbox pattern (write event + data in same DB transaction, relay to message bus)." },
    ]
  },
  {
    id: 8,
    title: "Infrastructure: DNS, CDN & Proxies",
    icon: "🏗️",
    color: "#84CC16",
    duration: "1.5 hrs",
    topics: ["How DNS Works", "CDN Architecture", "Forward vs Reverse Proxy", "Edge Computing", "Anycast"],
    content: `
## Infrastructure: DNS, CDN & Proxies

The network infrastructure that makes your system globally accessible.

---

### How DNS Works

When you type \`google.com\`:

1. Browser checks local cache
2. OS checks hosts file + DNS cache
3. Query goes to **Recursive Resolver** (your ISP / 8.8.8.8)
4. Resolver queries **Root Nameserver** → returns TLD server for \`.com\`
5. Resolver queries **TLD Nameserver** → returns authoritative NS for \`google.com\`
6. Resolver queries **Authoritative Nameserver** → returns IP
7. IP cached (TTL), response returned to browser

**DNS Record Types**:
| Type | Purpose |
|---|---|
| A | Domain → IPv4 |
| AAAA | Domain → IPv6 |
| CNAME | Alias → another domain |
| MX | Mail server |
| TXT | Verification, SPF, DKIM |
| NS | Authoritative nameserver |

**DNS-based load balancing**: Return different IPs for same domain (Round-Robin DNS, Geo DNS, Latency-based routing — used by Route 53)

---

### CDN Architecture

A CDN is a globally distributed network of **PoPs (Points of Presence)** caching content close to users.

**Request flow (Pull CDN)**:
1. User → DNS → nearest CDN edge
2. Cache hit → return from edge (10ms)
3. Cache miss → fetch from origin → cache → return (300ms)

**What to put on CDN**:
- ✅ Static assets: images, JS, CSS, fonts, videos
- ✅ Immutable content (hash in filename = infinite TTL)
- ❌ Personalized content (unless edge computing is used)
- ❌ Real-time data

**Cache-Control Headers**:
\`\`\`
Cache-Control: public, max-age=31536000, immutable  // 1 year for hashed assets
Cache-Control: public, max-age=3600                 // 1 hour for pages
Cache-Control: private, no-store                    // Don't cache (auth pages)
\`\`\`

---

### Forward vs Reverse Proxy

**Forward Proxy** (client side)
- Client → Forward Proxy → Internet
- Hides client IP, bypasses geo-restrictions
- Corporate firewalls, privacy tools (VPN-like)

**Reverse Proxy** (server side)
- Internet → Reverse Proxy → Backend servers
- Hides server topology, SSL termination, caching, compression
- nginx, HAProxy, Cloudflare are reverse proxies

---

### Anycast Routing

Multiple servers share the same IP address globally. BGP routing directs traffic to the nearest one.

Used by: CDNs, DNS (1.1.1.1, 8.8.8.8), DDoS mitigation

---

### Edge Computing

Run computation at CDN edge nodes, close to users:
- Cloudflare Workers, AWS Lambda@Edge
- A/B testing without round trip to origin
- Auth token validation at edge
- Personalization, geo-based redirects
    `,
    exercises: [
      "Draw the complete DNS resolution journey for a first-time visit to yourapp.com. Include all the servers involved and estimated latencies.",
      "Design CDN strategy for a video streaming service (Netflix-like). What do you cache? Where? What's your cache invalidation strategy?",
      "Your origin server is in US-East. A user in Singapore hits your site. Trace the request with and without CDN. Calculate approximate latency difference.",
    ],
    questions: [
      { q: "What is TTL in DNS and what are the tradeoffs of low vs high TTL?", a: "Time-To-Live: how long DNS records are cached. Low TTL (60s) = faster propagation of changes but more DNS queries. High TTL (86400s) = faster resolution, slower propagation." },
      { q: "How does Cloudflare protect against DDoS?", a: "Anycast absorbs traffic across many PoPs. Edge rate limiting drops malicious traffic before it reaches origin. Scrubbing centers filter traffic. Origin IP is hidden." },
      { q: "What's the difference between CDN and load balancer?", a: "Load balancer distributes traffic across servers in the same data center. CDN distributes content across global edge nodes closer to users. Both can be used together." },
    ]
  },
  {
    id: 9,
    title: "Security & Authentication",
    icon: "🔐",
    color: "#EC4899",
    duration: "2 hrs",
    topics: ["OAuth 2.0 & OIDC", "JWT", "API Keys", "mTLS", "HTTPS & TLS", "Common Vulnerabilities"],
    content: `
## Security & Authentication

How systems verify identity and protect data.

---

### Authentication vs Authorization

**Authentication (AuthN)**: Who are you? (Login)
**Authorization (AuthZ)**: What can you do? (Permissions)

---

### OAuth 2.0 Flow (Authorization Code)

Used for: "Login with Google/GitHub"

\`\`\`
1. User clicks "Login with Google"
2. Redirect to Google with client_id, redirect_uri, scope
3. User logs in and grants consent
4. Google redirects back with authorization code
5. Your server exchanges code for access_token (server-to-server)
6. Use access_token to fetch user info
\`\`\`

**Why exchange for code?** Access token never passes through browser URL bar (logged in server access logs).

---

### JWT (JSON Web Token)

A stateless token containing user identity.

\`\`\`
Header.Payload.Signature
\`\`\`

- **Header**: algorithm (HS256, RS256)
- **Payload**: claims (user_id, roles, exp, iat)
- **Signature**: HMAC of header+payload with secret

**Verification**: Server verifies signature without DB lookup → stateless, scalable

**Risks**:
- Can't invalidate before expiry (use short TTL + refresh tokens)
- Don't store sensitive data in payload (it's base64 decoded, not encrypted)
- Use RS256 for public key verification

---

### Session vs Token Auth

| | Sessions | JWT |
|---|---|---|
| Storage | Server-side (DB/Redis) | Client-side (cookie/localStorage) |
| Scalability | Requires shared session store | Stateless, any server can verify |
| Revocation | Immediate | Only at expiry (or blacklist) |
| Size | Small cookie (ID only) | Larger token |

---

### TLS / HTTPS

TLS (Transport Layer Security) encrypts data in transit:

1. Client → Server: "Hello, here are my supported cipher suites"
2. Server → Client: Certificate (public key)
3. Client verifies certificate chain against trusted CAs
4. Client sends encrypted pre-master secret
5. Both derive session keys → encrypted channel

**Certificate Pinning**: Client hardcodes expected certificate/public key. Prevents MITM even with compromised CA.

---

### Common Vulnerabilities (OWASP Top 10 Summary)

| Vulnerability | Attack | Defense |
|---|---|---|
| SQL Injection | \`'; DROP TABLE users\` | Parameterized queries, ORM |
| XSS | Script in user input | CSP headers, encode output |
| CSRF | Forged request using cookies | CSRF tokens, SameSite cookies |
| Broken Auth | Brute force, credential stuffing | Rate limiting, MFA, account lockout |
| Sensitive Data Exposure | Plain-text passwords | bcrypt hashing, encrypt at rest |
| SSRF | Server makes requests to internal | Allowlist outbound URLs |

---

### mTLS (Mutual TLS)

Both client AND server present certificates. Used for:
- Service-to-service auth in microservices
- Zero-trust architecture
- Automated via service mesh (Istio, Linkerd)
    `,
    exercises: [
      "Design the auth system for a multi-tenant SaaS app. Users belong to organizations with different roles. How do you handle JWT claims, session management, and SSO?",
      "Walk through a CSRF attack on a banking app. Then design the complete defense using CSRF tokens and SameSite cookies.",
      "Design a secure API key management system for a developer platform (like Stripe's API keys). Include creation, storage, rotation, and revocation.",
    ],
    questions: [
      { q: "Why store passwords with bcrypt instead of SHA-256?", a: "bcrypt is intentionally slow (configurable work factor) and includes a salt, making brute force and rainbow table attacks impractical. SHA-256 is fast — millions of hashes/sec with GPUs." },
      { q: "What is the difference between authorization code flow and implicit flow in OAuth?", a: "Code flow: auth code exchanged server-side for tokens (tokens never in browser). Implicit flow: tokens returned directly to browser URL (deprecated, insecure)." },
      { q: "How do you invalidate JWTs before expiry?", a: "Maintain a token blacklist in Redis (checked on each request). Or use short-lived access tokens (15min) + longer-lived refresh tokens that can be revoked in DB." },
    ]
  },
  {
    id: 10,
    title: "Observability & Reliability",
    icon: "📊",
    color: "#14B8A6",
    duration: "2 hrs",
    topics: ["The Three Pillars: Metrics, Logs, Traces", "SLOs, SLAs, SLIs", "Alerting", "Chaos Engineering", "Incident Management"],
    content: `
## Observability & Reliability

You can't improve what you can't measure. Observability is how you understand your system's behavior in production.

---

### The Three Pillars

**Metrics** — numerical measurements over time
- CPU usage, request rate, error rate, latency
- Tools: Prometheus, Datadog, CloudWatch
- Good for: dashboards, alerting, capacity planning

**Logs** — discrete events with context
- "User 123 paid order 456 at 14:23:01"
- Tools: Elasticsearch/Kibana (ELK), Splunk, CloudWatch Logs
- Good for: debugging specific incidents

**Traces** — request flow across services
- Full journey of one request across microservices
- Tools: Jaeger, Zipkin, Datadog APM, AWS X-Ray
- Good for: latency attribution, dependency analysis

---

### SLI, SLO, SLA

**SLI (Service Level Indicator)**: A metric you measure
- "99th percentile latency"
- "Percentage of successful requests"

**SLO (Service Level Objective)**: Your target for an SLI
- "P99 latency < 200ms"
- "Error rate < 0.1%"

**SLA (Service Level Agreement)**: Contractual commitment with consequences
- "99.9% uptime or credits issued"
- SLAs are weaker than SLOs (buffer for negotiation)

**Error Budget**: How much you can fail and still meet SLO
- 99.9% SLO = 0.1% error budget = ~43 min downtime/month
- Deploys consume error budget — if budget is low, slow down releases

---

### The Four Golden Signals (Google SRE)

1. **Latency** — time to serve a request (separate success vs error latency)
2. **Traffic** — requests/sec, events/sec
3. **Errors** — rate of failed requests (5xx, timeouts)
4. **Saturation** — how full is the system (CPU %, queue depth)

---

### Alerting Philosophy

**Alert on symptoms, not causes**:
- ❌ "CPU at 90%" (cause — maybe fine)
- ✅ "Error rate > 1%" (symptom — users affected)

**Avoid alert fatigue**:
- Only alert what requires human action
- Each alert should have a clear runbook

---

### Chaos Engineering

Intentionally inject failures to test resilience:
- Kill random instances (Netflix Chaos Monkey)
- Inject network latency (Chaos Mesh)
- Fill disks, exhaust connections
- Run in production (with safeguards)

**Failure Mode Analysis**: For each component, ask: "What happens if this fails?"
- Single point of failure? → Add redundancy
- What's the blast radius? → Add circuit breakers, bulkheads

---

### Graceful Degradation

When parts of the system fail, degrade gracefully:
- Show cached/stale data instead of error
- Disable non-critical features (recommendations)
- Return partial results with a warning
    `,
    exercises: [
      "Define SLIs and SLOs for a payment processing API. Calculate the error budget for a 99.95% SLO. How many minutes of downtime per month does that allow?",
      "Design a monitoring dashboard for a ride-sharing app. What metrics would you show? What alerts would you set up? What are your thresholds?",
      "Walk through a production incident: your P99 latency spiked from 150ms to 8s. How do you diagnose it using metrics, logs, and traces?",
    ],
    questions: [
      { q: "What is the difference between availability and reliability?", a: "Availability: fraction of time the system is up. Reliability: probability of performing correctly over a time period. A system can be available but unreliable (returns wrong data)." },
      { q: "What is a runbook?", a: "A documented procedure for handling a specific alert or incident. Reduces MTTD/MTTR by giving on-call engineers a clear playbook." },
      { q: "What is MTTR and MTTF?", a: "MTTR (Mean Time To Recovery): average time to restore service after a failure. MTTF (Mean Time To Failure): average time between failures. Reliability engineering maximizes MTTF, minimizes MTTR." },
    ]
  },
  {
    id: 11,
    title: "Real-World System Design Case Studies",
    icon: "🏛️",
    color: "#7C3AED",
    duration: "4 hrs",
    topics: ["Design URL Shortener", "Design Twitter/X Feed", "Design Netflix", "Design WhatsApp", "Design Uber", "Design Google Search"],
    content: `
## Real-World System Design Case Studies

Put it all together. These are the most common system design interview questions.

---

### Framework for Any Design Question

1. **Clarify requirements** (5 min)
   - Functional requirements (top 3 features)
   - Non-functional requirements (scale, latency, consistency)
   - Estimate scale: DAU, reads/writes, storage

2. **High-level design** (10 min)
   - Draw boxes: clients, load balancer, API servers, DB, cache
   - Happy path data flow

3. **Deep dive** (15 min)
   - Data model / schema
   - Critical components (scaling, caching, DB choice)
   - Handle bottlenecks

4. **Discuss tradeoffs** (5 min)
   - What you chose and why
   - What you'd do with more time

---

### Case Study 1: URL Shortener (bit.ly)

**Requirements**: 100M URLs shortened/day, 10:1 read:write ratio

**Key Design Decisions**:
- Short URL generation: Base62 encode auto-increment ID (or hash)
- Storage: Key-value store (Redis) + PostgreSQL for metadata
- Cache: 80/20 rule — top 20% of URLs get 80% of traffic → heavy caching
- Redirect: 301 (permanent, browser caches) vs 302 (track analytics)

---

### Case Study 2: Twitter Feed

**Requirements**: 300M users, celebrities with 50M followers, sub-second feed load

**Key Design Decisions**:
- **Fan-out on write** (pre-compute feed): Push tweet to all followers' feed cache on post. Fast reads. Expensive for celebrities.
- **Fan-out on read** (pull model): Compute feed on read. Slow for users.
- **Hybrid**: Fan-out on write for normal users, fan-out on read for celebrities (>10K followers)

---

### Case Study 3: Netflix Video Streaming

**Requirements**: 230M users, 15% global internet traffic, 4K video

**Key Design Decisions**:
- Store videos in S3, transcode to multiple resolutions (H.264, HEVC)
- Serve via CDN with 1000s of edge PoPs
- **Adaptive Bitrate Streaming (ABR)**: Switch quality based on bandwidth
- Recommendations: Offline ML training, results cached in Redis
- Microservices per domain: auth, catalog, playback, recommendations

---

### Case Study 4: WhatsApp Messaging

**Requirements**: 2B users, 100B messages/day, E2E encryption

**Key Design Decisions**:
- Use WebSockets for real-time delivery
- Message routing: Sender → Server → Recipient's WebSocket connection
- Offline: Store in DB, deliver when user comes online
- E2E Encryption: Signal Protocol (key exchange, double ratchet)
- One DB shard per user, consistent hashing

---

### Case Study 5: Uber (Ride Matching)

**Requirements**: Match riders to nearby drivers, GPS updates every 4s

**Key Design Decisions**:
- Driver location: geohashing → store in Redis sorted set by geohash
- Matching: Find drivers in same/adjacent geohash cells
- Supply/demand: Dynamic pricing based on area supply density
- Trip state machine: REQUESTED → MATCHED → EN_ROUTE → COMPLETED

---

### Case Study 6: Google Search

**Requirements**: 8.5B searches/day, sub-100ms results

**Key Design Decisions**:
- **Crawler**: Distributed crawl queue (URL frontier) → parse → index
- **Inverted Index**: word → list of (document, position, frequency)
- **Ranking**: PageRank + 200+ signals
- **Serving**: Distributed index shards, merge top-K results
- **Caching**: Popular queries cached, personalized results add user context
    `,
    exercises: [
      "Design a Pastebin-like service (store and share text). Define all components, estimate storage for 1M pastes/day, design the expiry mechanism.",
      "Design an Instagram Stories feature (24-hour expiry). How do you store, serve, and expire 500M stories/day efficiently?",
      "Design a Rate Limiter as a service. It should work across a fleet of 100 API servers with < 5ms latency overhead. Hint: distributed counting.",
    ],
    questions: [
      { q: "In Twitter's fan-out, why is the celebrity threshold set at ~10K followers?", a: "At 10K followers, fan-out on write is still manageable (10K cache writes per tweet). At 50M followers, it's impractical — takes too long and uses too much space." },
      { q: "How does Netflix know which CDN PoP to use for a client?", a: "Open Connect Appliances (OCAs) are Netflix's CDN nodes. A smart client (on device) or DNS steering selects the best OCA based on latency probes and ISP peering agreements." },
      { q: "How does geohashing work for location-based services?", a: "Divides the world into a hierarchical grid. Each cell has a string prefix. Adjacent cells share long common prefixes. Store driver locations by geohash → nearby drivers have similar hashes → fast range queries." },
      { q: "What is an inverted index and why is it used in search?", a: "Maps words to the documents containing them. Given query 'fast cars', instantly lookup which documents contain each word, then rank by relevance. Forward index (doc → words) is too slow for search." },
    ]
  },
];

const difficultyColors = {
  easy: "#10B981",
  medium: "#F59E0B",
  hard: "#EF4444"
};

export default function SystemDesignCourse() {
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAnswer = (key) => {
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleComplete = (id) => {
    setCompletedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredChapters = chapters.filter(ch =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalHours = chapters.reduce((sum, ch) => sum + parseFloat(ch.duration), 0);

  if (activeChapter) {
    const ch = activeChapter;
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        color: "#E8E8F0",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}>
        {/* Chapter Header */}
        <div style={{
          background: `linear-gradient(135deg, ${ch.color}22 0%, #0A0A0F 60%)`,
          borderBottom: `1px solid ${ch.color}33`,
          padding: "24px 32px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
        }}>
          <button
            onClick={() => setActiveChapter(null)}
            style={{
              background: "none",
              border: `1px solid #333`,
              color: "#999",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "12px",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.05em",
            }}
          >← BACK TO CHAPTERS</button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "32px" }}>{ch.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: ch.color, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", marginBottom: "4px" }}>
                CHAPTER {ch.id} · {ch.duration.toUpperCase()}
              </div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#F0F0F8" }}>{ch.title}</h1>
            </div>
            <button
              onClick={() => toggleComplete(ch.id)}
              style={{
                background: completedChapters.has(ch.id) ? ch.color : "transparent",
                border: `1px solid ${ch.color}`,
                color: completedChapters.has(ch.id) ? "#000" : ch.color,
                padding: "8px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "'Courier New', monospace",
                fontWeight: "bold",
                letterSpacing: "0.05em",
              }}
            >
              {completedChapters.has(ch.id) ? "✓ COMPLETED" : "MARK DONE"}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginTop: "20px" }}>
            {[
              { key: "content", label: "📖 Content" },
              { key: "exercises", label: "🏋️ Exercises" },
              { key: "questions", label: "❓ Questions" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? ch.color : "transparent",
                  border: `1px solid ${activeTab === tab.key ? ch.color : "#333"}`,
                  color: activeTab === tab.key ? "#000" : "#888",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.key ? "700" : "400",
                  transition: "all 0.2s",
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>

          {/* Topics Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
            {ch.topics.map(t => (
              <span key={t} style={{
                background: `${ch.color}18`,
                border: `1px solid ${ch.color}44`,
                color: ch.color,
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontFamily: "'Courier New', monospace",
              }}>{t}</span>
            ))}
          </div>

          {activeTab === "content" && (
            <div style={{
              lineHeight: "1.9",
              fontSize: "15px",
              color: "#CCCCDD",
            }}>
              {ch.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} style={{ color: ch.color, fontSize: "20px", borderBottom: `1px solid ${ch.color}33`, paddingBottom: "8px", marginTop: "32px" }}>{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} style={{ color: "#E0E0F0", fontSize: "16px", marginTop: "24px" }}>{line.slice(4)}</h3>;
                if (line.startsWith('#### ')) return <h4 key={i} style={{ color: "#AAAACC", fontSize: "14px", marginTop: "16px" }}>{line.slice(5)}</h4>;
                if (line.startsWith('> ')) return (
                  <div key={i} style={{
                    borderLeft: `3px solid ${ch.color}`,
                    paddingLeft: "16px",
                    margin: "16px 0",
                    color: "#BBBBCC",
                    fontStyle: "italic",
                    background: `${ch.color}08`,
                    padding: "12px 16px",
                    borderRadius: "0 8px 8px 0",
                  }}>{line.slice(2)}</div>
                );
                if (line.startsWith('- ') || line.startsWith('* ')) return (
                  <div key={i} style={{ paddingLeft: "20px", margin: "4px 0", display: "flex", gap: "8px" }}>
                    <span style={{ color: ch.color }}>▸</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
                if (line.startsWith('```')) return <div key={i} style={{ margin: "4px 0" }} />;
                if (line.startsWith('|')) {
                  const cells = line.split('|').filter(c => c.trim());
                  const isHeader = i > 0 && ch.content.split('\n')[i + 1]?.startsWith('|---');
                  const isSeparator = line.includes('---');
                  if (isSeparator) return null;
                  return (
                    <div key={i} style={{
                      display: "flex",
                      background: isHeader ? `${ch.color}22` : "transparent",
                      borderBottom: "1px solid #222",
                    }}>
                      {cells.map((cell, j) => (
                        <div key={j} style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontSize: "13px",
                          color: isHeader ? ch.color : "#CCCCDD",
                          fontWeight: isHeader ? "700" : "400",
                          fontFamily: isHeader ? "'Courier New', monospace" : "inherit",
                          borderRight: j < cells.length - 1 ? "1px solid #222" : "none",
                        }}>{cell.trim()}</div>
                      ))}
                    </div>
                  );
                }
                if (line.startsWith('    ') || line.startsWith('\t')) return (
                  <pre key={i} style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "12px",
                    color: "#88CC88",
                    background: "#111118",
                    margin: "2px 0",
                    padding: "0 16px",
                  }}>{line}</pre>
                );
                if (line === '---') return <hr key={i} style={{ border: "none", borderTop: "1px solid #222", margin: "24px 0" }} />;
                if (line === '') return <div key={i} style={{ height: "8px" }} />;
                return <p key={i} style={{ margin: "6px 0" }}
                  dangerouslySetInnerHTML={{
                    __html: line
                      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:#E8E8F0">$1</strong>`)
                      .replace(/\`(.*?)\`/g, `<code style="background:#1A1A28;padding:2px 6px;border-radius:3px;font-family:'Courier New',monospace;font-size:12px;color:${ch.color}">${'$1'}</code>`)
                  }}
                />;
              })}
            </div>
          )}

          {activeTab === "exercises" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ color: ch.color, fontSize: "18px", margin: "0 0 8px" }}>Practice Exercises</h2>
              {ch.exercises.map((ex, i) => (
                <div key={i} style={{
                  background: "#0E0E1A",
                  border: `1px solid ${ch.color}33`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  borderLeft: `4px solid ${ch.color}`,
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: ch.color,
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "0.15em",
                    marginBottom: "10px",
                  }}>EXERCISE {String(i + 1).padStart(2, '0')}</div>
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#DDDDEE" }}>{ex}</div>
                </div>
              ))}
              <div style={{
                background: `${ch.color}11`,
                border: `1px dashed ${ch.color}44`,
                borderRadius: "12px",
                padding: "16px 20px",
                fontSize: "13px",
                color: "#888",
                lineHeight: "1.6",
              }}>
                💡 <strong style={{ color: ch.color }}>Tip:</strong> For system design exercises, always start with requirements → estimation → high-level diagram → deep dive. Draw diagrams on paper or a whiteboard.
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ color: ch.color, fontSize: "18px", margin: "0 0 8px" }}>Interview Questions & Answers</h2>
              {ch.questions.map((qa, i) => {
                const key = `${ch.id}-${i}`;
                return (
                  <div key={i} style={{
                    background: "#0E0E1A",
                    border: `1px solid #222`,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}>
                    <button
                      onClick={() => toggleAnswer(key)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "18px 20px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        color: "#E0E0F0",
                        fontSize: "15px",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ color: ch.color, fontFamily: "'Courier New', monospace", fontSize: "12px", marginTop: "3px", minWidth: "24px" }}>Q{i + 1}</span>
                      <span style={{ flex: 1 }}>{qa.q}</span>
                      <span style={{ color: "#555", fontSize: "18px", marginTop: "-2px" }}>{revealedAnswers[key] ? "▲" : "▼"}</span>
                    </button>
                    {revealedAnswers[key] && (
                      <div style={{
                        padding: "0 20px 18px 56px",
                        borderTop: `1px solid ${ch.color}22`,
                        fontSize: "14px",
                        lineHeight: "1.7",
                        color: "#AAAACC",
                        background: `${ch.color}08`,
                      }}>
                        <div style={{ paddingTop: "14px" }}>
                          <span style={{ color: ch.color, fontFamily: "'Courier New', monospace", fontSize: "11px", letterSpacing: "0.1em" }}>ANSWER: </span>
                          {qa.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E8F0",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, #0F0F1E 0%, #0A0A0F 100%)",
        borderBottom: "1px solid #1A1A2E",
        padding: "48px 32px 36px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, #3B82F611 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8B5CF611 0%, transparent 50%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "11px",
          letterSpacing: "0.3em",
          color: "#666",
          marginBottom: "16px",
        }}>COMPLETE SYSTEM DESIGN CURRICULUM</div>
        <h1 style={{
          fontSize: "clamp(24px, 4vw, 40px)",
          fontWeight: "800",
          margin: "0 0 12px",
          background: "linear-gradient(135deg, #E8E8F8, #8888CC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
        }}>System Design Mastery</h1>
        <p style={{ color: "#6666AA", fontSize: "15px", margin: "0 0 28px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.6" }}>
          From CAP theorem to distributed tracing. Every concept, pattern, and real-world case study you need.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
          {[
            { label: "Chapters", value: chapters.length },
            { label: "Total Hours", value: `${totalHours}h` },
            { label: "Exercises", value: chapters.reduce((s, c) => s + c.exercises.length, 0) },
            { label: "Questions", value: chapters.reduce((s, c) => s + c.questions.length, 0) },
            { label: "Completed", value: `${completedChapters.size}/${chapters.length}` },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#E8E8F8", fontFamily: "'Courier New', monospace" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", marginTop: "2px" }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ maxWidth: "400px", margin: "24px auto 0", background: "#1A1A2E", borderRadius: "4px", height: "4px" }}>
          <div style={{
            width: `${(completedChapters.size / chapters.length) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "20px 32px 0", maxWidth: "900px", margin: "0 auto" }}>
        <input
          type="text"
          placeholder="Search chapters or topics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "#0E0E1A",
            border: "1px solid #222",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#E0E0F0",
            fontSize: "14px",
            outline: "none",
            fontFamily: "'Georgia', serif",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Chapter Grid */}
      <div style={{
        maxWidth: "900px",
        margin: "20px auto",
        padding: "0 24px 48px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "16px",
      }}>
        {filteredChapters.map(ch => (
          <div
            key={ch.id}
            onClick={() => { setActiveChapter(ch); setActiveTab("content"); setRevealedAnswers({}); }}
            style={{
              background: "#0E0E1A",
              border: `1px solid ${completedChapters.has(ch.id) ? ch.color + "55" : "#1E1E2E"}`,
              borderRadius: "14px",
              padding: "22px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `1px solid ${ch.color}77`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = `linear-gradient(135deg, ${ch.color}0A, #0E0E1A)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = `1px solid ${completedChapters.has(ch.id) ? ch.color + "55" : "#1E1E2E"}`;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#0E0E1A";
            }}
          >
            {completedChapters.has(ch.id) && (
              <div style={{
                position: "absolute", top: "14px", right: "14px",
                background: ch.color,
                color: "#000",
                borderRadius: "50%",
                width: "22px", height: "22px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "bold",
              }}>✓</div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>{ch.icon}</span>
              <div>
                <div style={{ fontSize: "10px", color: ch.color, fontFamily: "'Courier New', monospace", letterSpacing: "0.15em" }}>
                  CH.{String(ch.id).padStart(2, '0')} · {ch.duration.toUpperCase()}
                </div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#E8E8F0", marginTop: "2px" }}>{ch.title}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
              {ch.topics.slice(0, 3).map(t => (
                <span key={t} style={{
                  background: `${ch.color}15`,
                  color: ch.color,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontFamily: "'Courier New', monospace",
                }}>{t}</span>
              ))}
              {ch.topics.length > 3 && (
                <span style={{ color: "#555", fontSize: "11px", padding: "3px 6px" }}>+{ch.topics.length - 3} more</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#555", borderTop: "1px solid #1A1A28", paddingTop: "12px" }}>
              <span>🏋️ {ch.exercises.length} exercises</span>
              <span>❓ {ch.questions.length} questions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}