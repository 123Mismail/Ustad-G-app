"""
utils/notifications.py — Firebase FCM Push Notification Helper

Dry-run mode: if FIREBASE_CREDENTIALS_PATH is not set or file is missing,
notifications are logged to stdout instead of being sent.
"""
import os
from app.config import get_settings

_firebase_initialized = False

def _get_app():
    """Lazily initialize Firebase Admin SDK (once per process)."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    import firebase_admin
    from firebase_admin import credentials

    settings = get_settings()
    cred_path = settings.firebase_credentials_path
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("[FCM] Firebase Admin SDK initialized.")
    else:
        print("[FCM] No Firebase credentials found — running in dry-run mode.")
        _firebase_initialized = True # Mark as initialized to avoid re-printing


async def send_push_notification(device_token: str, title: str, body: str) -> bool:
    """
    Send a push notification to a device via Firebase FCM.
    Falls back to console log if Firebase is not configured.

    Returns True if sent successfully (or dry-run), False on error.
    """
    if not device_token:
        print(f"[FCM DRY-RUN] No device_token — would send:\n  Title: {title}\n  Body: {body}")
        return True

    _get_app()

    settings = get_settings()
    cred_path = settings.firebase_credentials_path
    if not cred_path or not os.path.exists(cred_path):
        print(f"[FCM DRY-RUN] Title: {title} | Body: {body}")
        return True

    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=device_token,
        )
        response = messaging.send(message)
        print(f"[FCM] Notification sent: {response}")
        return True
    except Exception as e:
        print(f"[FCM] Error sending notification: {e}")
        return False
