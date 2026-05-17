import asyncio
import uuid
import requests

# Base URL for FastAPI live dev server
BASE_URL = "http://127.0.0.1:8000/v1"

def test_user_crud():
    print("\n============================================================")
    print("PART 1 — User CRUD & Duplicate Enforcements")
    print("============================================================")

    # 1. Register a new user
    user_phone = f"0312{uuid.uuid4().hex[:7]}"
    user_email = f"test.user.{uuid.uuid4().hex[:6]}@ustadg.com"
    payload = {
        "name": "Hamza Ali",
        "phone": user_phone,
        "email": user_email,
        "city": "Karachi",
        "area": "Clifton"
    }

    print(f"Registering Hamza Ali with phone '{user_phone}'...")
    res = requests.post(f"{BASE_URL}/users", json=payload)
    assert res.status_code == 201, f"Failed registration: {res.text}"
    user_id = res.json()["id"]
    print(f"Successfully registered. User ID: {user_id}")

    # 2. Try registering duplicate phone
    print("Registering duplicate phone (should fail with 409)...")
    res_dup_phone = requests.post(f"{BASE_URL}/users", json={
        "name": "Hamza Ali Clone",
        "phone": user_phone,
        "email": f"clone.{user_email}",
        "area": "Clifton"
    })
    assert res_dup_phone.status_code == 409, f"Expected 409 conflict, got: {res_dup_phone.status_code}"
    print(f"[PASS] Correctly rejected duplicate phone: {res_dup_phone.json()['detail']}")

    # 3. Try registering duplicate email
    print("Registering duplicate email (should fail with 409)...")
    res_dup_email = requests.post(f"{BASE_URL}/users", json={
        "name": "Hamza Ali Clone 2",
        "phone": f"0313{uuid.uuid4().hex[:7]}",
        "email": user_email,
        "area": "Clifton"
    })
    assert res_dup_email.status_code == 409, f"Expected 409 conflict, got: {res_dup_email.status_code}"
    print(f"[PASS] Correctly rejected duplicate email: {res_dup_email.json()['detail']}")

    # 4. Retrieve profile
    print(f"Retrieving profile for User ID {user_id}...")
    res_get = requests.get(f"{BASE_URL}/users/{user_id}")
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "Hamza Ali"
    print(f"[PASS] Successfully retrieved user profile: {res_get.json()['name']} ({res_get.json()['area']})")


def test_swarm_personalization():
    print("\n============================================================")
    print("PART 2 — Swarm Personalization & History Persistence")
    print("============================================================")

    session_id = f"t13-session-{uuid.uuid4().hex[:8]}"
    phone = "03001234567" # Seeded user "Osman" in "Gulshan-e-Iqbal"

    # Step 2a: Greet receptionist passing Osman's phone
    print(f"\n[2a] Sending greeting for Osman ({phone}) in new session '{session_id}'...")
    payload1 = {
        "session_id": session_id,
        "message": "Assalam-o-Alaikum! Hello receptionist",
        "user_phone": phone
    }
    res1 = requests.post(f"{BASE_URL}/chat", json=payload1)
    assert res1.status_code == 200, f"Chat failed: {res1.text}"
    
    reply1 = res1.json()["reply"]
    print(f"Swarm Reply 1:\n{reply1}")
    
    # Verify the reply welcomes Osman by name
    assert "osman" in reply1.lower(), f"Expected name 'Osman' in reply, but got: {reply1}"
    print("[PASS] Receptionist successfully recognized and greeted Osman by name!")

    # Step 2b: Ask for plumber in the same session (simulating conversation reload/continuation)
    # Since he is registered in Gulshan-e-Iqbal, it should auto-fill location to Gulshan
    print(f"\n[2b] Continuing session '{session_id}' asking for plumber (without specifying location)...")
    payload2 = {
        "session_id": session_id,
        "message": "mujhe ek plumber chahiye",
        "user_phone": phone
    }
    res2 = requests.post(f"{BASE_URL}/chat", json=payload2)
    assert res2.status_code == 200, f"Chat failed: {res2.text}"

    reply2 = res2.json()["reply"]
    print(f"Swarm Reply 2:\n{reply2}")

    # Verify that the Discovery agent automatically located him in Gulshan-e-Iqbal and returned Ali Plumber Services
    assert "gulshan" in reply2.lower() or "ali plumber" in reply2.lower() or "karachi plumbing" in reply2.lower(), \
        f"Expected auto-filled location 'Gulshan' or provider in response, but got: {reply2}"
    print("[PASS] DiscoveryAgent successfully resolved saved location 'Gulshan-e-Iqbal' from system context!")

def main():
    try:
        test_user_crud()
        test_swarm_personalization()
        print("\n[PASS] Task 13 persistence and user recognition verified successfully!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()
