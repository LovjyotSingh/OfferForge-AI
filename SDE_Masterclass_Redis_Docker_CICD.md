# ⚡ SDE MASTERCLASS HANDBOOK: Redis, Docker & CI/CD Pipelines
> **Author**: Lovjyot Singh  
> **Topics**: Redis 0 to 100 | Docker 0 to 100 | CI/CD Pipelines 0 to 100  

---

## 🟢 SECTION 1: REDIS 0 TO 100 (In-Memory Distributed Mastery)

### 1. Core Fundamentals & High-Speed Architecture
- **Redis Definition**: In-memory key-value data structure store delivering sub-millisecond latency at 100,000+ QPS.
- **RAM Latency vs Disk**: RAM access (~100ns) is 1,000x faster than NVMe SSDs (~100,000ns). Redis stores datasets in RAM.
- **Single-Threaded Core**: Command execution runs on a single-threaded loop, eliminating context switching, race conditions, and thread locking overhead.
- **Non-Blocking I/O**: Uses Linux `epoll` / macOS `kqueue` Reactor event loops to process thousands of socket connections without blocking.
- **Redis 6.0+ I/O Threads**: Network payload reading/writing is offloaded to background threads while command execution remains 100% single-threaded.

### 2. Data Structures & C Implementations
- **Strings**: Binary safe up to 512MB. Implemented via Simple Dynamic String (SDS). Commands: `SET`, `GET`, `INCRBY`, `SETNX`.
- **Hashes**: Field-value objects implemented via `listpack` or `hashtable`. Ideal for user profiles & structured SKU objects.
- **Lists**: Doubly-linked `quicklist`. Commands: `LPUSH`, `RPOP`, `BRPOP` (blocking queue for job processing).
- **Sets**: Unordered unique strings. Implemented via `intset` or `hashtable` (`SADD`, `SINTER`).
- **Sorted Sets (ZSet)**: Ranked score-element pairs implemented via SkipList + HashTable ($O(\log N)$). Used for leaderboards & rate limiters.
- **HyperLogLog**: Probabilistic cardinality estimator counting billions of unique items with 0.81% error rate in 12KB RAM (`PFADD`, `PFCOUNT`).

### 3. Concurrency, Locks & Lua Scripting
- **Lua Scripting (`EVAL`)**: Executes multi-command atomic transactions without network roundtrips.
- **SwiftShelf 2-Phase Concurrency Lock**: Deducts inventory and creates a temporary 10-minute lock key in a single atomic Lua script to guarantee 0% overselling during flash sales.

```lua
-- Atomic Lua Script Example
local current = tonumber(redis.call('GET', KEYS[1]))
if current and current >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3])
    return 1 -- Success
else
    return 0 -- Out of Stock
end
```

- **Eviction Policies**: `allkeys-lru` (Least Recently Used), `allkeys-lfu` (Least Frequently Used), `volatile-ttl`, and `noeviction` (returns error on full RAM).

### 4. Persistence, Replication & Clustering
- **RDB (Redis DB Snapshot)**: Point-in-time binary snapshots (`dump.rdb`) via `fork()` child process. Fast startup, potential minor data loss on crash.
- **AOF (Append-Only File)**: Logs every write operation to `appendonly.aof` with `fsync everysec` policy. Sub-1s data loss.
- **Redis Cluster (Sharding)**: Distributes datasets across 16,384 Hash Slots calculated via $\text{CRC16}(\text{key}) \pmod{16384}$ across master nodes.

### 5. System Design Interview Patterns & Pitfalls
- **Cache Stampede (Thundering Herd)**: When a hot key expires, thousands hit DB simultaneously. *Fix*: Mutex lock or XFetch early expiration.
- **Cache Penetration**: Non-existent key queries bypass cache to DB. *Fix*: Cache null values (`SET key "-1" EX 300`) or Bloom Filters.
- **Cache Breakdown**: A single hot key expires. *Fix*: Set no TTL or update key asynchronously in background.

---

## 🐳 SECTION 2: DOCKER 0 TO 100 (Containerization & Runtime Architecture)

### 1. Containerization vs Virtualization
- **VMs vs Containers**: VMs emulate hardware with Hypervisors and guest OS per VM. Containers share the Host OS Kernel, launching in milliseconds with lightweight RAM usage.
- **Linux Namespaces**: Provides process isolation: PID (processes), NET (network interfaces), MNT (mount points), IPC (inter-process communication).
- **Linux Control Groups (cgroups)**: Enforces resource limits and metering: restricts CPU, Memory, Disk I/O per container.

### 2. Docker Engine Architecture
- **Components**: Docker CLI -> Docker REST API -> Docker Daemon (`dockerd`) -> `containerd` -> `runc` (OCI runtime).
- **Union File Systems (Overlay2)**: Container images consist of read-only stacked layers. Container instances write to a Copy-on-Write (CoW) top layer.

### 3. Dockerfile Best Practices & Multi-Stage Builds
- **Multi-Stage Builds**: Separate compile-time build tools from final runtime images to minimize security attack vectors and image size (from 1GB down to 50MB).

```dockerfile
# Multi-Stage Dockerfile Example
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
USER node
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- **Layer Caching**: Order Dockerfile directives from least to most frequently changed (`COPY package.json` before `COPY .`).
- **Security Hardening**: Never run container as root. Use `USER node` or `USER 1001`, run security scans (Trivy), and use `.dockerignore`.

### 4. Docker Networking & Volumes
- **Bridge Network**: Default isolated network driver for containers running on the same single host.
- **Host Network**: Removes network isolation between container and host for maximum performance.
- **Volumes vs Bind Mounts**: Volumes are managed by Docker in `/var/lib/docker/volumes` (best for production). Bind mounts map exact host paths.

---

## 🚀 SECTION 3: CI/CD PIPELINES 0 TO 100 (Automated Deployment & DevOps)

### 1. Core Concepts: CI vs CD vs CD
- **Continuous Integration (CI)**: Automated code compilation, linting, unit testing, and static analysis triggered on every git push or pull request.
- **Continuous Delivery (CD)**: Automates build artifacts (Docker images tagged with Git SHA to registry) & staging deployment; manual approval for prod.
- **Continuous Deployment (CD)**: Fully automated pipeline passing all tests and pushing code directly to production without manual intervention.

### 2. Complete Production Pipeline Lifecycle
`Git Push` -> `Lint & Type Check` -> `Run Unit Tests` -> `Build OCI Image` -> `Security Vulnerability Scan` -> `Push to Registry` -> `Deploy` -> `Smoke Test` -> `Auto Rollback on Failure`.

### 3. Enterprise Deployment Strategies
- **Blue-Green Deployment**: Two identical production environments (Blue=Active, Green=Idle). Traffic switched instantaneously at Load Balancer level. 0 downtime, instant rollback.
- **Canary Deployment**: Routes 5%-10% of live traffic to the new version. Monitors error rates & metrics before scaling to 100%.
- **Rolling Update**: Sequentially replaces old instances with new instances batch-by-batch across the cluster.

### 4. GitHub Actions Production Workflow

```yaml
name: Production CI/CD Pipeline
on:
  push:
    branches: [ main ]
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:unit
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/lovjyotsingh/swiftshelf:${{ github.sha }}
```

### 5. Pipeline Security & Best Practices
- **Least Privilege Access**: Scope GitHub Actions tokens (`permissions: contents: read, packages: write`).
- **Secret Masking**: Never hardcode credentials; inject secrets at runtime via environment variables.
- **Ephemeral Runners**: Use disposable, isolated runner instances for build environments to prevent cross-contamination.
