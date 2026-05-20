"""
utils/scheduler.py — APScheduler AsyncIOScheduler

Provides a shared scheduler instance for scheduling background jobs.
Lifecycle: started in main.py lifespan startup, shut down on shutdown.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
