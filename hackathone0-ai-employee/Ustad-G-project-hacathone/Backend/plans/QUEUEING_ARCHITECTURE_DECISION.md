# Architecture Decision Record (ADR): Queueing & Scheduling Strategy

## 🏛️ Context & Problem Statement

For UstadG's notification lifecycle, we need a reliable, fault-tolerant background scheduling system that guarantees:
1. **Instant Action:** Triggering confirmation/cancellation notifications immediately.
2. **Future Execution (The "Delay" Problem):** Scheduling a departure reminder to fire exactly 1 hour before an appointment time (e.g. tomorrow at 10:00 AM).
3. **Fault Tolerance:** Surviving server process crashes or container updates without losing scheduled tasks.

This document reviews the trade-offs of using **Apache Kafka**, **Celery + Redis**, and **PostgreSQL + APScheduler** to solve this problem at production scale.

---

## 🏎️ Option 1: Apache Kafka (Distributed Streaming Log)

### Technical Analysis
Apache Kafka is a highly durable distributed commit log built for high-throughput, low-latency, real-time message streaming. 

* **The Mismatch:** Kafka is designed around a **"Publish Now, Consume Immediately"** streaming pattern. It **does not natively support delay queues** or delayed task execution (running an event tomorrow at 10 AM).
* **The Workaround:** Implementing delay queues in Kafka requires maintaining complex custom retry topics, storing states in DBs, or using partition pausing logic in consumers, which introduces substantial bug surface.
* **Operational Cost:** Kafka requires KRaft or Zookeeper cluster configurations, disk provisioning, JVM tuning, and high infrastructure costs.

### Pros & Cons
*   **PRO:** Infinite scaling potential (millions of events/sec).
*   **PRO:** World-class event-sourcing and transaction logging.
*   **CON:** Extreme operational complexity and hosting costs for early/medium scale.
*   **CON:** **No native delayed task API.** Very difficult to coordinate "schedule at specific time" execution.

---

## 🏆 Option 2: Celery + Redis (Python Enterprise Standard)

### Technical Analysis
Celery is a task queue framework for Python, using Redis or RabbitMQ as an in-memory, disk-persisted message broker.

* **Delayed Execution:** Celery natively supports future execution using the `ETA` or `countdown` parameters. 
* **Worker Decoupling:** Web processes (`uvicorn` threads) push light tasks to Redis and return immediately. Isolated, distributed `Celery` workers fetch and process them asynchronously.
* **Fault Tolerance:** If a worker crashes mid-task, standard configurations ensure the broker reschedules the task to another worker.

### Pros & Cons
*   **PRO:** Native support for delayed task execution out of the box (`apply_async(eta=...)`).
*   **PRO:** Decoupled architecture—web server crashing does not affect workers.
*   **PRO:** De facto python industry standard with high community support.
*   **CON:** Requires running extra infrastructure (a Redis or RabbitMQ instance).

#### Code Integration Pattern
```python
# app/tasks.py
from celery import Celery
from app.utils.notifications import send_push_notification

celery_app = Celery("ustadg", broker="redis://localhost:6379/0")

@celery_app.task
def send_delayed_notification(device_token: str, title: str, body: str):
    send_push_notification(device_token, title, body)
```

```python
# app/routers/book.py
from app.tasks import send_delayed_notification

# Enqueues notification to fire tomorrow at 10:00 AM
send_delayed_notification.apply_async(
    args=[user.device_token, "Your Ustad is coming!", body],
    eta=appointment_time - timedelta(hours=1)
)
```

---

## 🎯 Option 3: PostgreSQL + APScheduler (Lightweight Persistent DB Store)

### Technical Analysis
APScheduler runs directly inside the FastAPI process thread, but is configured to use a persistent PostgreSQL database (`SQLAlchemyJobStore`) to persist scheduled jobs.

### Pros & Cons
*   **PRO:** Extremely easy to set up—**zero new infrastructure required** (runs inside your existing Postgres DB).
*   **PRO:** Native Cron, interval, and precise datetime scheduling.
*   **PRO:** Job definitions survive crashes, dynamically reloading when FastAPI starts up.
*   **CON:** Scalability is tied to database CPU limits and the web process's memory. Not decoupled from the main web server.

---

## 📊 Architectural Trade-Off Matrix

| Metric | Option 1: Apache Kafka | Option 2: Celery + Redis | Option 3: PostgreSQL + APScheduler |
| :--- | :--- | :--- | :--- |
| **Best Fit** | High-throughput logging, telemetry, data pipelines. | Complex asynchronous tasks, future notifications, retries. | Monolith deployments, cron jobs, early-to-mid scale scheduling. |
| **Delayed Execution** | ❌ Complex (Hacks required) |  **Excellent (Native ETA)** |  **Excellent (Native Date Trigger)** |
| **Operational Overhead** | 🔴 Extremely High | 🟡 Medium (Needs Redis instance) | 🟢 Very Low (No new infra) |
| **Task Decoupling** |  **Excellent** |  **Excellent** | ❌ Weak (Shares FastAPI process memory) |
| **Crash Durability** |  **Excellent** |  **Excellent** (Persisted in Redis) |  **Excellent** (Persisted in DB rows) |

---

## 📈 Evolutionary Path & Recommendation

For UstadG's scale lifecycle, we recommend an evolutionary approach:

```
[Phase 1 & 2: MVP] -> In-Memory APScheduler (Fastest time to market)
          │
          ▼
[Phase 2.5: Production Launch] -> Postgres-backed APScheduler (No extra cost, crash-proof)
          │
          ▼
[Phase 3: High Scale Growth] -> Celery + Redis (Fully decoupled async worker tier)
          │
          ▼
[Phase 4: Hyper-Scale Logging] -> Apache Kafka (For telemetry, audit logs, active tracking)
```

### Final Architecture Stance
* **Do not use Kafka for delayed push notifications.** It is a tool mismatch for time-delayed tasks.
* Use **Postgres-backed APScheduler** for early launch (low cost/maximum simplicity).
* Move to **Celery + Redis** when active user volumes start requiring separate background worker fleets.

---

*Version: 1.0 | ADR: Event Architecture | Project: UstadG | Created: 2026-05-18*
