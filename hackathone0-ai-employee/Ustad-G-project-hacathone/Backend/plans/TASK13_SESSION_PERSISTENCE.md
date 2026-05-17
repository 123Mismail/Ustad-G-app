# Implementation Plan: Task 13 — Chat History Persistence & User Recognition 👤

## Goal Description
Currently, the UstadG Agent Swarm has two limitations in its user and conversation tracking:
1. **No User Profiles:** The system treats every user as anonymous. It cannot greet them by name, remember their email, or use their saved search area to speed up provider search.
2. **No Chat History Persistence:** Chat history is stored in-memory (`InMemorySessionService`). When Uvicorn restarts, reloads, or crashes, the entire conversation history is lost.

We will implement a **complete User Recognition and Chat History Persistence System**:
1. **User Profile Store (`app/models/user.py`):** Save user details (Name, Phone, Email, Saved Address: City & Area).
2. **Persistent Session Service (`app/db/session_service.py`):** Subclass ADK's `InMemorySessionService` to serialize and deserialize the entire Pydantic `Session` object (including all messages and tool results) directly to/from a `chat_sessions` table in SQLite.
3. **Pydantic Chat Request Extension (`app/schemas/chat.py`):** Add `user_phone` to the API request schema.
4. **Dynamic Personalization (`app/agents/orchestrator.py`):** Look up user details in the DB and inject a system context prompt. Gemini will welcome them by name and auto-fill their proximity search without asking for their location!

---

## Proposed Changes

### 1. Database & Models

#### [NEW] [user.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/models/user.py)
Create the SQLAlchemy model for registered users:
```python
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    city = Column(String(100), default="Karachi", nullable=False)
    area = Column(String(100), nullable=False)  # e.g. "Gulshan-e-Iqbal"
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### [NEW] [session.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/models/session.py)
Create the SQLAlchemy model for chat sessions:
```python
from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from app.db.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(100), primary_key=True, index=True) # session_id
    app_name = Column(String(100), nullable=False)
    user_id = Column(String(100), nullable=False)
    session_data = Column(Text, nullable=False)  # JSON-serialized ADK Session Pydantic model
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### [NEW] [session_service.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/db/session_service.py)
Implement `PersistentSessionService` which extends `InMemorySessionService` to load/save ADK session structures using SQLAlchemy.

---

### 2. Swarm Orchestration & Router Updates

#### [MODIFY] [chat.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/schemas/chat.py)
Add `user_phone` to `ChatRequest`:
```python
class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "ur"
    user_phone: str | None = None
```

#### [MODIFY] [orchestrator.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/agents/orchestrator.py)
- Replace `InMemorySessionService` with our new `PersistentSessionService`.
- Inside `run_ustadg_swarm`, look up the user profile.
- **Context Minimization Optimization:**
  - To prevent prompt inflation and save token costs, we only inject the context on the **very first message** of a new session (`if len(session.events) == 0`).
  - We keep the system context extremely minimal (less than 15 tokens), only including the absolute necessary context:
    `[Saved Location: Gulshan-e-Iqbal, Karachi | User Name: Osman]`
  - Gemini reads this tiny metadata prefix, greets the user by name, and auto-fills their location for search, while keeping the chat history pristine and cheap!
- Save the session to the DB at the end of execution to commit the updated events and messages!

---

### 3. Database Seeding

#### [MODIFY] [init_db.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/db/init_db.py)
Seed a mock user:
* Name: **Osman**
* Phone: **03001234567**
* Email: **osman@gmail.com**
* City: **Karachi**
* Area: **Gulshan-e-Iqbal**

---

## Verification Plan

### Automated Tests
1. **Re-run Seeder:** `uv run python -m app.db.init_db` to create `users` and `chat_sessions` tables.
2. **Personalization & History Test (`tests/test_task13.py`):**
   - **Step 1 (First Message):** Send `"Assalam-o-Alaikum"` with `user_phone="03001234567"`. Verify reply welcomes him by name `"Osman"`.
   - **Step 2 (Simulate Reload):** Query again with same `session_id` saying `"Mujhe plumber chahiye"` without passing location.
   - Verify the agent remembers the previous greeting AND automatically finds providers in **Gulshan-e-Iqbal** by pulling his saved location from history/profile.
