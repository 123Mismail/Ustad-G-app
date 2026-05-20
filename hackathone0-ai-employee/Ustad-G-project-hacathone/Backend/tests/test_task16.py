import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

# Add the Backend folder to the sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.notifications import send_push_notification
from app.utils.scheduler import scheduler

async def test_notifications_dry_run():
    print("="*50)
    print("1. Testing Instant Notification (Dry Run)")
    print("="*50)
    
    # Send a push notification (this should trigger dry-run since FIREBASE_CREDENTIALS_PATH is likely empty)
    result = await send_push_notification(
        device_token="test_device_token_123",
        title="✅ Booking Confirmed!",
        body="UGK-TEST-1234 — Ali Plumber. Tomorrow 10:00 AM."
    )
    if result:
        print("[PASS] Instant notification sent (or dry-run logged).")
    else:
        print("[FAIL] Instant notification failed.")


async def test_scheduler():
    print("\n" + "="*50)
    print("2. Testing APScheduler (Background Job)")
    print("="*50)
    
    scheduler.start()
    
    # Schedule a job 2 seconds from now
    run_time = datetime.now(timezone.utc) + timedelta(seconds=2)
    print(f"[TEST] Scheduling a reminder at {run_time}...")
    
    job = scheduler.add_job(
        send_push_notification,
        trigger="date",
        run_date=run_time,
        kwargs={
            "device_token": "test_device_token_123",
            "title": "⏰ Your Ustad is departing soon!",
            "body": "Ali Plumber is heading your way. Appointment at 10:00 AM."
        },
        id="test_reminder_123",
        replace_existing=True,
    )
    
    if job:
        print(f"[PASS] Job added successfully: {job.id}")
        
    # Wait for the job to fire
    print("[TEST] Waiting 3 seconds for the job to fire...")
    await asyncio.sleep(3)
    
    # The job should no longer exist after firing
    job_exists = scheduler.get_job("test_reminder_123")
    if not job_exists:
        print("[PASS] Job executed and removed from scheduler.")
    else:
        print("[FAIL] Job did not fire or was not removed.")
        
    # Test Cancellation
    print("\n[TEST] Testing Job Cancellation...")
    cancel_time = datetime.now(timezone.utc) + timedelta(minutes=5)
    scheduler.add_job(
        send_push_notification,
        trigger="date",
        run_date=cancel_time,
        kwargs={
            "device_token": "test_device_token_123",
            "title": "Should not fire",
            "body": "Will be cancelled."
        },
        id="test_cancel_123",
    )
    
    print("[TEST] Job added for 5 minutes from now. Removing it...")
    scheduler.remove_job("test_cancel_123")
    
    if not scheduler.get_job("test_cancel_123"):
        print("[PASS] Scheduled reminder successfully removed on cancellation.")
    else:
        print("[FAIL] Job was not removed.")
        
    scheduler.shutdown(wait=False)

if __name__ == "__main__":
    asyncio.run(test_notifications_dry_run())
    asyncio.run(test_scheduler())
    print("\n✅ Task 16 notification infrastructure tests completed.")
