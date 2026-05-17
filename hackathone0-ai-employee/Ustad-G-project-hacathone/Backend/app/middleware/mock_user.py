"""
middleware/mock_user.py — MockUser context injection for Phase 1 rapid testing.

Skill pattern: Use Depends() for clean dependency injection instead of global state.

In Phase 1, all protected endpoints use MockUser instead of real JWT auth.
In Phase 2 (Task 2.1), this is replaced by Supabase JWT verification.

Usage:
    from app.middleware.mock_user import MockUser, get_mock_user
    
    @router.post("/chat")
    async def chat(user: MockUser = Depends(get_mock_user)):
        print(user.name)  # "Test User"
"""

from dataclasses import dataclass, field
from fastapi import Depends, Request


@dataclass
class MockUser:
    """
    Simulated user context for Phase 1 testing.
    Mirrors the real User model that will come from Supabase in Phase 2.
    """
    id: str = "mock-user-001"
    name: str = "Test User"
    language: str = "ur"             # Default language: Urdu
    location: str = "Karachi"        # Default city
    budget_sensitivity: str = "medium"  # low | medium | high

    # Saved addresses (will come from Supabase profile in Phase 2)
    saved_home: str = "Gulshan-e-Iqbal, Karachi"
    saved_office: str = "I.I. Chundrigar Road, Karachi"


def get_mock_user(request: Request) -> MockUser:
    """
    Dependency that returns a MockUser.
    
    Skill pattern: Injectable via Depends() — swap this out for real
    JWT verification in Phase 2 without changing any router signatures.

    Optional: Override via X-Mock-User-Language header for multilingual testing.
    """
    user = MockUser()

    # Allow language override via header for easy testing
    lang_override = request.headers.get("X-Mock-User-Language")
    if lang_override in ("ur", "en"):
        user.language = lang_override

    # Allow location override via header
    loc_override = request.headers.get("X-Mock-User-Location")
    if loc_override:
        user.location = loc_override

    return user
