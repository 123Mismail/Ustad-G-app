import json
import sqlite3
from typing import Optional, Any
from google.adk.sessions import InMemorySessionService, Session

class PersistentSessionService(InMemorySessionService):
    def save_session_sync(self, session: Session) -> None:
        """Synchronously persist a Session to the SQLite database."""
        conn = sqlite3.connect("ustadg.db")
        cursor = conn.cursor()
        try:
            session_json = session.model_dump_json()
            cursor.execute(
                """
                INSERT INTO chat_sessions (id, app_name, user_id, session_data, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                    session_data=excluded.session_data,
                    updated_at=datetime('now')
                """,
                (session.id, session.app_name, session.user_id, session_json)
            )
            conn.commit()
            print(f"[SESSION_DB] Saved session {session.id} to SQLite DB.")
        except Exception as e:
            print(f"[SESSION_DB] Error saving session {session.id}: {e}")
        finally:
            conn.close()

    def _load_session_sync(self, app_name: str, user_id: str, session_id: str) -> Optional[dict]:
        """Synchronously load a Session state dict from SQLite."""
        conn = sqlite3.connect("ustadg.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute(
                "SELECT session_data FROM chat_sessions WHERE id = ? AND app_name = ? AND user_id = ?",
                (session_id, app_name, user_id)
            )
            row = cursor.fetchone()
            if row:
                return json.loads(row["session_data"])
        except Exception as e:
            print(f"[SESSION_DB] Error loading session {session_id}: {e}")
        finally:
            conn.close()
        return None

    async def create_session(self, *, app_name: str, user_id: str, state: Optional[dict[str, Any]] = None, session_id: Optional[str] = None) -> Session:
        session = await super().create_session(app_name=app_name, user_id=user_id, state=state, session_id=session_id)
        self.save_session_sync(session)
        return session

    async def get_session(self, *, app_name: str, user_id: str, session_id: str, config: Optional[Any] = None) -> Optional[Session]:
        # Try local cache first
        session = await super().get_session(app_name=app_name, user_id=user_id, session_id=session_id, config=config)
        if session:
            return session

        # Load from SQLite
        session_data = self._load_session_sync(app_name, user_id, session_id)
        if session_data:
            print(f"[SESSION_DB] Successfully restored session {session_id} from SQLite DB.")
            session = Session.model_validate(session_data)
            # Cache it back in InMemorySessionService._sessions dict
            self._sessions[(app_name, user_id, session_id)] = session
            return session

        return None
