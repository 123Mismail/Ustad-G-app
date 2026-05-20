import json
from typing import Optional, Any
from google.adk.sessions import InMemorySessionService, Session
from app.db.database import SyncSessionLocal
from app.models.session import ChatSession

class PersistentSessionService(InMemorySessionService):
    def save_session_sync(self, session: Session) -> None:
        """Synchronously persist a Session using SQLAlchemy (db-agnostic)."""
        session_json = session.model_dump_json()
        with SyncSessionLocal() as db_session:
            try:
                chat_session = ChatSession(
                    id=session.id,
                    app_name=session.app_name,
                    user_id=session.user_id,
                    session_data=session_json
                )
                db_session.merge(chat_session)
                db_session.commit()
                print(f"[SESSION_DB] Saved session {session.id} using SQLAlchemy.")
            except Exception as e:
                db_session.rollback()
                print(f"[SESSION_DB] Error saving session {session.id}: {e}")

    def _load_session_sync(self, app_name: str, user_id: str, session_id: str) -> Optional[dict]:
        """Synchronously load a Session state dict using SQLAlchemy."""
        with SyncSessionLocal() as db_session:
            try:
                row = db_session.query(ChatSession).filter_by(
                    id=session_id, app_name=app_name, user_id=user_id
                ).first()
                if row:
                    return json.loads(row.session_data)
            except Exception as e:
                print(f"[SESSION_DB] Error loading session {session_id}: {e}")
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

        # Load using SQLAlchemy
        session_data = self._load_session_sync(app_name, user_id, session_id)
        if session_data:
            print(f"[SESSION_DB] Successfully restored session {session_id} using SQLAlchemy.")
            session = Session.model_validate(session_data)
            # Cache it back in InMemorySessionService.sessions dict
            if app_name not in self.sessions:
                self.sessions[app_name] = {}
            if user_id not in self.sessions[app_name]:
                self.sessions[app_name][user_id] = {}
            self.sessions[app_name][user_id][session_id] = session
            return session

        return None
